import * as fs from 'fs';
import { pipeline } from 'stream/promises';
import { URL } from 'url';
import path from 'path';
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

export interface PrepareDownloadParams<T extends Downloadable> {
  url: string;
  destDir: string;
  srcEntity: T;
  destFilenameResolver: FilenameResolver<T>;
  signal: AbortSignal;
}

export interface StartDownloadOverrides {
  destFilePath?: string;
  tmpFilePath?: string;
}

export class FetcherError extends Error {

  url: string;

  constructor(message: string, url: string) {
    super(message);
    this.name = 'FetcherError';
    this.url = url;
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

  constructor(config: DownloaderConfig<any>, cookie?: string, logger?: Logger | null) {
    this.#cookie = cookie;
    this.#logger = logger;
    this.#dryRun = config.dryRun;
    this.#fsHelper = new FSHelper(config, logger);
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
    try {
      const res = await fetch(request, { signal });
      return await (type === 'html' ? res.text() : res.json()) as FetcherGetResultOf<T>;
    }
    catch (error: any) {
      if (signal?.aborted) {
        throw error;
      }
      if (rt < maxRetries) {
        return this.get({ url, type, payload, maxRetries }, rt + 1);
      }
      const errMsg = error instanceof Error ? error.message : error;
      const retriedMsg = rt > 0 ? ` (retried ${rt} times)` : '';
      throw new FetcherError(`${errMsg}${retriedMsg}`, urlObj.toString());
    }
  }

  async prepareDownload<T extends Downloadable>(params: PrepareDownloadParams<T>) {
    const { url, destFilenameResolver, destDir, signal } = params;
    const request = new Request(url, { method: 'GET' });
    // Note: do not set cookie and host in headers except for attachments, otherwise you'll get 404 Not Found.
    if (params.srcEntity.type === 'attachment') {
      /**
       * Special handling for attachments.
       * 1. Send request with cookie. Server will redirect response to actual download URL.
       *    However, in the request to redirect URL, the cookie and host set in headers will
       *    cause server to return 404 - Not Found.
       * 2. So we need to make another request to the redirect URL, this time without
       *    setting cookie and host in headers. Server should return response 200, allowing us to stream
       *    the response body to file.
       */
      this.#setHeaders(request, 'html');
    }
    else {
      this.#setHeaders(request, 'html', { setCookie: false, setHost: false });
    }

    const internalAbortController = new AbortController();
    if (signal) {
      signal.addEventListener('abort', () => internalAbortController.abort(), {once: true});
    }

    let res = await fetch(request, { signal: internalAbortController.signal });

    // Special handling for attachment
    if (params.srcEntity.type === 'attachment' && !res.ok && res.redirected && res.url) {
      const redirectReq = new Request(res.url, { method: 'GET' });
      this.#setHeaders(redirectReq, 'html', { setCookie: false, setHost: false });
      res = await fetch(redirectReq, { signal: internalAbortController.signal });
    }

    if (this.#assertResponseOK(res, url)) {
      const destFilename = destFilenameResolver.resolve(res);
      const destFilePath = path.resolve(destDir, destFilename);

      const progress = new Progress(res, {
        reportInterval: 300
      });
      const monitor = new FetcherProgressMonitor(progress, destFilename, destFilePath);

      const _res = res;
      const start = (overrides?: StartDownloadOverrides) => {
        const _destFilePath = overrides?.destFilePath || destFilePath;
        const _tmpFilePath = overrides?.tmpFilePath || FSHelper.createTmpFilePath(_destFilePath);
        return this.#startDownload(_res, _tmpFilePath, _destFilePath, progress);
      };
      const abort = () => {
        internalAbortController.abort();
      };

      return {
        destFilePath,
        monitor,
        start,
        abort
      };
    }

    return undefined as never;
  }

  async #startDownload(
    response: Response & { body: NodeJS.ReadableStream },
    tmpFilePath: string,
    destFilePath: string,
    progress: Progress) {

    try {
      let size = 0;
      if (this.#dryRun) {
        try {
          for await (const chunk of response.body) {
            size += chunk.length;
          }
        }
        catch (error) {
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
        this.#commitDownload(tmpFilePath, destFilePath, size);
      };

      const discard = () => {
        this.#cleanupDownload(tmpFilePath);
      };

      return {
        tmpFilePath,
        commit,
        discard
      };
    }
    catch (error) {
      this.#cleanupDownload(tmpFilePath);
      throw error;
    }
  }

  #commitDownload(tmpFilePath: string, destFilePath: string, size: number) {
    try {
      this.log('debug', `Commit "${tmpFilePath}" to "${destFilePath}; filesize: ${size} bytes`);
      this.#fsHelper.rename(tmpFilePath, destFilePath);
    }
    finally {
      this.#cleanupDownload(tmpFilePath);
    }
  }

  #cleanupDownload(tmpFilePath: string) {
    try {
      if (this.#dryRun || fs.existsSync(tmpFilePath)) {
        this.log('debug', `Clean up "${tmpFilePath}"`);
        this.#fsHelper.unlink(tmpFilePath);
      }
    }
    catch (error) {
      this.log('error', `Error cleaning up "${tmpFilePath}:`, error);
    }
  }

  #setHeaders(request: Request, type: 'html' | 'json', opts?: { setCookie?: boolean; setHost?: boolean; }) {
    const setCookie = pickDefined(opts?.setCookie, true);
    const setHost = pickDefined(opts?.setHost, true);
    if (this.#cookie && setCookie) {
      request.headers.set('Cookie', this.#cookie);
    }
    if (setHost) {
      request.headers.set('Host', 'www.patreon.com');
    }
    request.headers.set('User-Agent', USER_AGENT);
    if (type === 'json') {
      request.headers.set('Content-Type', 'application/vnd.api+json');
    }
    else {
      request.headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8');
    }
  }

  #assertResponseOK(response: Response | null, originURL: string, requireBody: false): response is Response;
  #assertResponseOK(response: Response | null, originURL: string, requireBody?: true): response is Response & { body: NodeJS.ReadableStream };
  #assertResponseOK(response: Response | null, originURL: string, requireBody = true) {
    if (!response) {
      throw new FetcherError('No response', originURL);
    }
    if (!response.ok) {
      throw new FetcherError(`${response.status} - ${response.statusText}`, originURL);
    }
    if (requireBody && !response.body) {
      throw new FetcherError('Empty response body', originURL);
    }
    return true;
  }

  protected log(level: LogLevel, ...msg: Array<any>) {
    commonLog(this.#logger, level, this.name, ...msg);
  }
}
