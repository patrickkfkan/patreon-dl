import * as fs from 'fs';
import { pipeline } from 'stream/promises';
import { fetch, Request, type Response } from 'undici';
import path from 'path';
import { type Dispatcher } from 'undici';
import FetcherProgressMonitor from './FetcherProgressMonitor.js';
import { type Downloadable } from '../entities/Downloadable.js';
import type FilenameResolver from './FllenameResolver.js';
import { pickDefined } from './Misc.js';
import {type LogLevel} from './logging/Logger.js';
import type Logger from './logging/Logger.js';
import { commonLog } from './logging/Logger.js';
import FSHelper from './FSHelper.js';
import { type DownloaderConfig } from '../downloaders/Downloader.js';
import Progress from './Progress.js';
import { createProxyAgent } from './Proxy.js';
import { SITE_URL } from './URLHelper.js';

export interface PrepareDownloadParams<T extends Downloadable> {
  url: string;
  srcEntity: T;
  destFilePath: string;
  setReferer?: boolean;
  signal: AbortSignal;
}

export interface StartDownloadOverrides {
  destFilePath?: string;
  tmpFilePath?: string;
}

export class FetcherError extends Error {

  url: string;
  method: string;

  constructor(message: string, url: string, method: string) {
    super(message);
    this.name = 'FetcherError';
    this.url = url;
    this.method = method;
  }
}

export type FetcherGetType = 'html' | 'json';
export type FetcherGetResultOf<T extends FetcherGetType> =
  T extends 'html' ? string :
  T extends 'json' ? any :
  never;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';

export default class Fetcher {

  name = 'Fetcher';

  #cookie?: string;
  #logger?: Logger | null;
  #dryRun: boolean;
  #fsHelper: FSHelper;
  #proxyAgent?: Dispatcher;

  constructor(config: DownloaderConfig<any>, logger?: Logger | null) {
    this.#cookie = config.cookie;
    this.#logger = logger;
    this.#dryRun = config.dryRun;
    this.#fsHelper = new FSHelper(config, logger);
    this.#proxyAgent = createProxyAgent(config)?.agent || undefined;
  }

  async get<T extends FetcherGetType>(args: {
    url: string,
    type: T,
    payload?: Record<string, any>,
    maxRetries: number,
    signal?: AbortSignal
  }, rt = 0): Promise<FetcherGetResultOf<T>> {

    const { url, type, payload, maxRetries, signal } = args;

    const urlObj = new URL(url);
    if (payload) {
      for (const [ p, v ] of Object.entries(payload)) {
        urlObj.searchParams.set(p, v);
      }
    }
    const request = new Request(urlObj, { method: 'GET' });
    this.#setHeaders(request, type);
    const internalAbortController = new AbortController();
    let removeAbortHandler: undefined | (() => void) = undefined;
    if (signal) {
      const abortHandler = () => internalAbortController.abort();
      signal.addEventListener('abort', abortHandler, {once: true});
      removeAbortHandler = () => signal.removeEventListener('abort', abortHandler);
    }
    try {
      const res = await fetch(request, { signal: internalAbortController.signal, dispatcher: this.#proxyAgent });
      return await (type === 'html' ? res.text() : res.json()) as FetcherGetResultOf<T>;
    }
    catch (error: any) {
      if (signal?.aborted) {
        throw error;
      }
      if (rt < maxRetries) {
        if (removeAbortHandler) removeAbortHandler();
        return await this.get({ url, type, payload, maxRetries, signal }, rt + 1);
      }
      let errMsg;
      if (error instanceof Error) {
        const errMsgParts = [error.message];
        let _err = error.cause;
        while (_err) {
          errMsgParts.push(_err instanceof Error ? _err.message : JSON.stringify(_err));
          _err = _err instanceof Error ? _err.cause : null;
        }
        errMsg = errMsgParts.join(': ');
      }
      else {
        errMsg = String(error);
      }
      const retriedMsg = rt > 0 ? ` (retried ${rt} times)` : '';
      throw new FetcherError(`${errMsg}${retriedMsg}`, urlObj.toString(), request.method);
    }
    finally {
      if (removeAbortHandler) removeAbortHandler();
    }
  }

  async resolveDestFilePath<T extends Downloadable>(params: {
    url: string;
    destDir: string;
    destFilenameResolver: FilenameResolver<T>;
    setReferer?: boolean;
    signal?: AbortSignal;
  }) {
    const { url, destDir, destFilenameResolver, setReferer = false, signal } = params;
    const request = new Request(url, { method: 'HEAD' });
    this.#setHeaders(request, 'html', { setCookie: false, setHost: false, setReferer });
    const internalAbortController = new AbortController();
    const abortHandler = () => internalAbortController.abort();
    if (signal) {
      signal.addEventListener('abort', abortHandler, {once: true});
    }

    try {
      const res = await fetch(request, { signal: internalAbortController.signal, dispatcher: this.#proxyAgent });

      if (this.#assertResponseOK(res, url, request.method, false)) {
        const destFilename = destFilenameResolver.resolve(res);
        const destFilePath = path.resolve(destDir, destFilename);
        return destFilePath;
      }
    }
    finally {
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }
    }

    return undefined as never;
  }

  async prepareDownload<T extends Downloadable>(params: PrepareDownloadParams<T>) {
    const { url, srcEntity, destFilePath, setReferer = false, signal } = params;
    const request = new Request(url, { method: 'GET' });
    this.#setHeaders(request, 'html', { setCookie: false, setHost: false, setReferer });
    const internalAbortController = new AbortController();
    let removeAbortHandler: undefined | (() => void) = undefined;
    if (signal) {
      const abortHandler = () => internalAbortController.abort();
      signal.addEventListener('abort', abortHandler, {once: true});
      removeAbortHandler = () => signal.removeEventListener('abort', abortHandler);
    }

    try {
      let res = await fetch(request, { signal: internalAbortController.signal, dispatcher: this.#proxyAgent });

      // Special handling for attachment
      if (params.srcEntity.type === 'attachment' && !res.ok && res.redirected && res.url) {
        const redirectReq = new Request(res.url, { method: 'GET' });
        this.#setHeaders(redirectReq, 'html', { setCookie: false, setHost: false });
        res = await fetch(redirectReq, { signal: internalAbortController.signal, dispatcher: this.#proxyAgent });
      }

      if (this.#assertResponseOK(res, url, request.method)) {
        const destFilename = path.parse(destFilePath).base;
        const progress = new Progress(res, {
          reportInterval: 300
        });
        const monitor = new FetcherProgressMonitor(progress, destFilename, destFilePath);

        const _res = res;
        const start = (overrides?: StartDownloadOverrides) => {
          const _destFilePath = overrides?.destFilePath || destFilePath;
          const _tmpFilePath = overrides?.tmpFilePath || FSHelper.createTmpFilePath(_destFilePath, srcEntity.id);
          return this.#startDownload(_res, _tmpFilePath, _destFilePath, progress, removeAbortHandler)
        };
        const abort = () => {
          if (removeAbortHandler) removeAbortHandler();
          internalAbortController.abort();
        };

        return {
          monitor,
          start,
          abort
        };
      }
    }
    catch (error: unknown) {
      if (removeAbortHandler) removeAbortHandler();
      throw error;
    }

    return undefined as never;
  }

  async #startDownload(
    response: Response & { body: NodeJS.ReadableStream },
    tmpFilePath: string,
    destFilePath: string,
    progress: Progress,
    cleanup?: () => void) {

    try {
      let size = 0;
      if (this.#dryRun) {
        try {
          for await (const chunk of response.body) {
            size += chunk.length;
          }
        }
        catch (_error: unknown) {
          // Do nothing
        }
      }
      else {
        this.log('debug', `Pipe "${response.url}" to "${tmpFilePath}"`);
        await pipeline(
          response.body,
          progress.stream,
          fs.createWriteStream(tmpFilePath)
        );
        size = fs.lstatSync(tmpFilePath).size;
      }

      const commit = () => {
        this.#commitDownload(tmpFilePath, destFilePath, size, cleanup);
      };

      const discard = () => {
        this.#cleanupDownload(tmpFilePath, cleanup);
      };

      return {
        tmpFilePath,
        commit,
        discard
      };
    }
    catch (error) {
      this.#cleanupDownload(tmpFilePath, cleanup);
      throw error;
    }
  }

  #commitDownload(tmpFilePath: string, destFilePath: string, size: number, cleanup?: () => void) {
    try {
      this.log('debug', `Commit "${tmpFilePath}" to "${destFilePath}; filesize: ${size} bytes`);
      this.#fsHelper.rename(tmpFilePath, destFilePath);
    }
    finally {
      this.#cleanupDownload(tmpFilePath, cleanup);
    }
  }

  #cleanupDownload(tmpFilePath: string, extra?: () => void) {
    try {
      if (this.#dryRun || fs.existsSync(tmpFilePath)) {
        this.log('debug', `Clean up "${tmpFilePath}"`);
        this.#fsHelper.unlink(tmpFilePath);
      }
    }
    catch (error) {
      this.log('error', `Error cleaning up "${tmpFilePath}:`, error);
    }
    finally {
      if (extra) extra();
    }
  }

  #setHeaders(request: Request, type: 'html' | 'json', opts?: { setCookie?: boolean; setHost?: boolean; setReferer?: boolean; }) {
    const setCookie = pickDefined(opts?.setCookie, true);
    const setHost = pickDefined(opts?.setHost, true);
    const setReferer = pickDefined(opts?.setReferer, false);
    if (this.#cookie && setCookie) {
      request.headers.set('Cookie', this.#cookie);
    }
    if (setHost) {
      request.headers.set('Host', 'www.patreon.com');
    }
    if (setReferer) {
      request.headers.set('referer', SITE_URL);
    }
    request.headers.set('User-Agent', USER_AGENT);
    if (type === 'json') {
      request.headers.set('Content-Type', 'application/vnd.api+json');
    }
    else {
      request.headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8');
    }
  }

  #assertResponseOK(response: Response | null, originURL: string, method: string, requireBody: false): response is Response;
  #assertResponseOK(response: Response | null, originURL: string, method: string, requireBody?: true): response is Response & { body: NodeJS.ReadableStream };
  #assertResponseOK(response: Response | null, originURL: string, method: string, requireBody = true) {
    if (!response) {
      throw new FetcherError('No response', originURL, method);
    }
    if (!response.ok) {
      throw new FetcherError(`${response.status} - ${response.statusText}`, originURL, method);
    }
    if (requireBody && !response.body) {
      throw new FetcherError('Empty response body', originURL, method);
    }
    return true;
  }

  protected log(level: LogLevel, ...msg: Array<any>) {
    commonLog(this.#logger, level, this.name, ...msg);
  }
}
