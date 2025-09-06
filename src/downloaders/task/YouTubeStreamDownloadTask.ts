import * as InnertubeLib from 'youtubei.js';
import { type YouTubePostEmbed } from '../../entities/Post.js';
import { createWriteStream } from 'fs';
import speedometer from 'speedometer';
import DownloadTask, { type DownloadProgress, type DownloadTaskParams } from './DownloadTask.js';
import deepEqual from 'deep-equal';

export type YouTubeStreamType = 'video' | 'audio' | 'video+audio';

export interface YouTubeStream<T extends YouTubeStreamType> {
  type: T;
  url: string;
  quality: string;
  itag: number;
  contentLength?: number;
  cpn: string;
};

export interface YouTubeStreamDownloadTaskParams<T extends YouTubeStreamType> extends DownloadTaskParams<YouTubePostEmbed> {
  innertube: InnertubeLib.Innertube;
  stream: YouTubeStream<T>
  destFilePath: string;
  callback: () => void;
}

export default class YouTubeStreamDownloadTask<T extends YouTubeStreamType> extends DownloadTask<YouTubePostEmbed> {

  name = 'YouTubeStreamDownloadTask';

  #destFilePath: string;
  #innertube: InnertubeLib.Innertube;
  #stream: YouTubeStream<T>;
  #downloadStream: ReadableStream | null;
  #progress: {
    length: number;
    transferred: number;
    speed: number;
    speedometer: speedometer.Speedometer;
    lastReported: DownloadProgress | null;
    reportTimer: NodeJS.Timeout | null;
  };
  #callback: YouTubeStreamDownloadTaskParams<T>['callback'];
  #startPromise: Promise<void> | null;
  #abortController: AbortController | null;
  #abortingCallback: (() => void) | null;

  constructor(params: YouTubeStreamDownloadTaskParams<T>) {
    super(params);
    this.#innertube = params.innertube;
    this.#stream = params.stream;
    this.#destFilePath = params.destFilePath;
    this.#downloadStream = null;
    this.#progress = {
      length: params.stream.contentLength ?? 0,
      transferred: 0,
      speed: 0,
      speedometer: speedometer(),
      lastReported: null,
      reportTimer: null
    };
    this.#callback = params.callback;
    this.#startPromise = null;
    this.#abortController = null;
    this.#abortingCallback = null;
  }

  protected resolveDestPath() {
    return Promise.resolve(this.#destFilePath);
  }

  async start() {
    if (!this.#startPromise) {
      this.#startPromise = new Promise((resolve) => {
        void (async () => {
          await super.start();
          this.#callback();
          this.#startPromise = null;
          resolve();
        })();
      })
    }
    return this.#startPromise;
  }

  protected async doStart() {
    if (this.status === 'aborted') {
      return;
    }
    this.notifyStart();
    this.#setProgressReportTimer();
    this.#abortController = new AbortController();
    try {
      this.#downloadStream = await this.#createDownloadStream(this.#stream, this.#innertube.session.actions);
      this.log('debug', `Download YouTube stream "${this.#stream.url}" to "${this.#destFilePath}"`);
      const file = !this.config.dryRun ? createWriteStream(this.#destFilePath) : null;
      for await (const chunk of InnertubeLib.Utils.streamToIterable(this.#downloadStream)) {
        if (this.#abortController.signal.aborted) {
          throw Error('Aborted');
        }
        if (file) {
          file.write(chunk);
        }
        this.#progress.transferred += chunk.byteLength;
        this.#progress.speed = this.#progress.speedometer(chunk.byteLength);
      }
      this.log('debug', `Saved "${this.#destFilePath}"; filesize: ${this.#progress.transferred} bytes`);
      this.#reportProgress();
      this.notifyComplete();
    }
    catch (error: unknown) {
      this.#reportProgress();
      if (this.#abortController.signal.aborted && this.#abortingCallback) {
        this.#abortingCallback();
      }
      else {
        this.notifyError(error);
      }
    }
  }

  protected async doAbort() {
    return new Promise<void>((resolve) => {
      if (this.#abortController) {
        this.#abortingCallback = () => {
          void (async () => {
            this.#abortingCallback = null;
            if (this.#downloadStream) {
              await this.#downloadStream.cancel();
            }
            this.notifyAbort();
            resolve();
          })();
        };
        this.#abortController.abort();
      }
      else {
        resolve();
      }
    });
  }

  protected async doDestroy() {
    if (this.isRunning()) {
      await this.doAbort();
    }
    this.#downloadStream = null;
  }

  protected doGetProgress() {
    return this.#progress.lastReported;
  }

  #setProgressReportTimer() {
    if (this.#progress.reportTimer) {
      clearTimeout(this.#progress.reportTimer);
      this.#progress.reportTimer = null;
    }
    this.#progress.reportTimer = setTimeout(() => {
      this.#progress.reportTimer = null;
      this.#reportProgress();
      if (!this.hasEnded()) {
        this.#setProgressReportTimer();
      }
    }, 300);
  }

  #reportProgress() {
    const filePath = this.resolvedDestPath;
    const filename = this.resolvedDestFilename;
    if (!filePath || !filename) {
      return;
    }
    const { length, transferred, speed, lastReported } = this.#progress;
    const progress: DownloadProgress = {
      destFilePath: filePath,
      destFilename: filename,
      length,
      lengthDownloaded: transferred,
      lengthUnit: 'byte',
      percent: length > 0 ? Number((transferred / length * 100).toFixed(2)) : undefined,
      sizeDownloaded: Number((transferred / 1000).toFixed(2)),
      speed: Number((speed / 1000).toFixed(2))
    };
    if (!lastReported || !deepEqual(lastReported, progress)) {
      this.#progress.lastReported = progress;
      this.notifyProgress(progress);
    }
  }

  // Mostly taken from YouTube.js:
  // https://github.com/LuanRT/YouTube.js/blob/9694a48270e75cd83bce03cab26f8ad0451168c2/src/utils/FormatUtils.ts#L10
  async #createDownloadStream<T extends YouTubeStreamType>(
    stream: YouTubeStream<T>,
    actions: InnertubeLib.Actions
  ): Promise<ReadableStream<Uint8Array>> {
    // If we're not downloading the video in chunks, we just use fetch once.
    if (stream.type === 'video+audio') {
      const response = await actions.session.http.fetch_function(`${stream.url}&cpn=${stream.cpn}`, {
        method: 'GET',
        headers: InnertubeLib.Constants.STREAM_HEADERS,
        redirect: 'follow'
      });

      // Throw if the response is not 2xx
      if (!response.ok)
        throw Error(`Innertube error: failed to fetch YouTube stream - the server responded with a non 2xx status code (${response.status} - ${response.statusText})`);

      const body = response.body;

      if (!body)
        throw Error('Innertube error: failed to fetch YouTube stream - fetch response missing body');

      return body;
    }

    // We need to download in chunks.

    const chunk_size = 1048576 * 10; // 10MB

    let chunk_start = 0;
    let chunk_end = chunk_size;
    let must_end = false;

    let cancel: AbortController;

    return new ReadableStream<Uint8Array>({
      start() { // Do nothing
      },
      pull: async (controller) => {
        if (must_end) {
          controller.close();
          return;
        }

        if (chunk_end >= (stream.contentLength ?? 0)) {
          must_end = true;
        }

        return new Promise((resolve, reject) => {
          void (async () => {
            try {
              cancel = new AbortController();
              const response = await this.#fetchStreamResponse(
                stream,
                [chunk_start, chunk_end],
                actions,
                cancel.signal
              );
  
              // Throw if the response is not 2xx
              if (!response.ok)
                throw Error(`Innertube error: failed to fetch YouTube stream - the server responded with a non 2xx status code (${response.status} - ${response.statusText})`);
  
              const body = response.body;
  
              if (!body)
                throw Error('Innertube error: failed to fetch YouTube stream - fetch response missing body');
  
              for await (const chunk of InnertubeLib.Utils.streamToIterable(body)) {
                controller.enqueue(chunk);
              }
  
              chunk_start = chunk_end + 1;
              chunk_end += chunk_size;
  
              resolve();
  
            } catch (e: any) {
              reject(e as Error);
            }
          })();
        });
      },
      cancel(reason) {
        cancel.abort(reason);
      }
    }, {
      highWaterMark: 1, // TODO: better value?
      size(chunk) {
        return chunk.byteLength;
      }
    });
  }

  async #fetchStreamResponse(
    stream: YouTubeStream<YouTubeStreamType>,
    range: [number, number?],
    actions: InnertubeLib.Actions,
    signal?: AbortSignal,
    retries = 3,
    delayMs = 2000
  ): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await actions.session.http.fetch_function(`${stream.url}&cpn=${stream.cpn}&range=${range[0]}-${range[1] || ''}`, {
          method: 'GET',
          headers: {
            ...InnertubeLib.Constants.STREAM_HEADERS
            // XXX: use YouTube's range parameter instead of a Range header.
            // Range: `bytes=${chunk_start}-${chunk_end}`
          },
          signal
        });

        return response;

      } catch (error: unknown) {
        const isLastAttempt = attempt === retries;
        const retriedMsg = isLastAttempt ? `- Retried ${retries} times - giving up` : `- ${attempt > 1 ? `Retried ${attempt} times - ` : ''}will retry after ${delayMs / 1000} seconds`;
        this.log('error', `Error fetching YouTube stream chunks in range ${range[0]} - ${range[1]}:`, error, retriedMsg);
        if (isLastAttempt) {
          throw error;
        }
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    throw Error(`Unexpected failure in fetching YouTube stream chunks (retried ${retries} times)`);
  }
}
