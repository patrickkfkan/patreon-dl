import path from 'path';
import { type Downloadable } from '../../entities/Downloadable.js';
import {type LogLevel} from '../../utils/logging/Logger.js';
import type Logger from '../../utils/logging/Logger.js';
import { commonLog } from '../../utils/logging/Logger.js';
import FSHelper from '../../utils/FSHelper.js';
import { type DownloaderConfig } from '../Downloader.js';
import type Bottleneck from 'bottleneck';
import {fileTypeFromFile} from 'file-type';
import fs from 'fs/promises';
import { imageSize } from 'image-size';

export class DownloadTaskError extends Error {
  task: IDownloadTask;
  cause?: Error;

  constructor(message: string, task: IDownloadTask, cause?: Error) {
    super(message);
    this.name = 'DownloadTaskError';
    this.task = task;
    this.cause = cause;
  }
}

export type DownloadTaskSkipReason = {
  message: string;
} & ({
  name: 'destFileExists';
  existingDestFilePath: string;
} | {
  name: 'includeMediaByFilenameUnfulfilled';
  itemType: 'image' | 'audio' | 'attachment';
  pattern: string;
  destFilename: string;
} | {
  name: 'dependentTaskNotCompleted'
} | {
  name: 'other';
})

export interface DownloadProgress {
  destFilename: string;
  destFilePath: string;
  lengthUnit: string;
  length?: number; // Measured in `lengthUnit`
  lengthDownloaded: number; // Measured in `lengthUnit`
  percent?: number;
  sizeDownloaded: number; // Kb
  speed: number; // Kb/s
}

export interface DownloadTaskParams<T extends Downloadable = Downloadable> {
  src: string;
  srcEntity: T,
  config: DownloaderConfig<any>;
  downloadType: 'main' | 'thumbnail' | 'variant';
  callbacks: DownloadTaskCallbacks | null;
  logger?: Logger | null;
}

export interface DownloadTaskCallbacks {
  onStart: (task: DownloadTask) => void;
  onProgress: (task: DownloadTask, progress: DownloadProgress | null) => void;
  onComplete: (task: DownloadTask) => void;
  onAbort: (task: DownloadTask) => void;
  onSkip: (task: DownloadTask, reason: DownloadTaskSkipReason) => void;
  onError: (error: DownloadTaskError, willRetry: boolean) => void;
  onSpawn: (origin: DownloadTask, spawn: DownloadTask) => void;
}

export type DownloadTaskStatus =
  'pending' |
  'pending-retry' | // Pending retry on error
  'downloading' |
  'error' |
  'completed' |
  'aborted' |
  'skipped';

const ENDED_STATUSES: DownloadTaskStatus[] = [
  'error',
  'completed',
  'aborted',
  'skipped'
];

export interface IDownloadTask {
  id: number;
  src: string;
  srcEntity: Downloadable;
  retryCount: number;
  resolvedDestFilename: string | null;
  resolvedDestPath: string | null;
  getProgress: () => DownloadProgress | null;
}

export default abstract class DownloadTask<T extends Downloadable = Downloadable> implements IDownloadTask {

  protected abstract name: string;

  static #idCounter = 0;

  #id: number;
  #config: DownloaderConfig<any>;
  #src: string;
  #retryCount: number;
  #resolvedDestPath: string | null;
  #srcEntity: T;
  #downloadType: 'main' | 'thumbnail' | 'variant';
  #callbacks: DownloadTaskCallbacks | null;
  #logger?: Logger | null;
  #lastProgress: DownloadProgress | null;
  #status: DownloadTaskStatus;
  #fsHelper: FSHelper;
  #doa: {
    msg: string;
    cause: unknown;
  } | null;

  #startPromise: Promise<void> | null;
  #startingCallback: (() => void) | null;
  #abortPromise: Promise<void> | null;

  constructor(params: DownloadTaskParams<T>) {
    this.#id = DownloadTask.#idCounter;
    this.#config = params.config;
    this.#src = params.src;
    this.#retryCount = 0;
    this.#resolvedDestPath = null;
    this.#srcEntity = params.srcEntity;
    this.#downloadType = params.downloadType;
    this.#callbacks = params.callbacks;
    this.#logger = params.logger;
    this.#lastProgress = null;
    this.#status = 'pending';
    this.#doa = null;
    this.#startPromise = null;
    this.#startingCallback = null;
    this.#abortPromise = null;

    this.#fsHelper = new FSHelper(params.config, params.logger);

    DownloadTask.#idCounter++;
  }

  protected abstract resolveDestPath(signal?: AbortSignal): Promise<string>;
  protected abstract doStart(): Promise<void>;
  protected abstract doAbort(): Promise<void>;
  protected abstract doDestroy(): Promise<void>;
  protected abstract doGetProgress(): DownloadProgress | null | undefined;

  static async create<A extends DownloadTask<B>, B extends Downloadable, C extends DownloadTaskParams<B>>(
    classname: new (p: C) => A,
    params: C,
    limiter?: Bottleneck,
    signal?: AbortSignal
  ): Promise<A> {
    const task = new classname(params);
    const maxRetries = params.config.request.maxRetries;
    const __doResolveDestPath = async () => {
      let t = 0;
      let err: unknown;
      while (t < maxRetries + 1) {
        try {
          const p = await task.resolveDestPath(signal);
          task.resolvedDestPath = p;
          task.log('debug', `(Task create #${task.srcEntity.id}) Resolved dest path: "${p}"`);
          return {
            hasError: false,
            destPath: p
          };
        }
        catch (error: unknown) {
          if (signal?.aborted) {
            throw error;
          }
          const willRetry = t < maxRetries ? 'will retry' : 'max reached';
          const retryStr = t > 0 ? `retried ${t} times - ${willRetry}`: willRetry;
          task.log('error', `(Task create #${task.srcEntity.id}) Error resolving dest path (${retryStr}):`, error);
          err = error;
          t++;
        }
      }
      return {
        hasError: true,
        msg: 'Could not resolve destination path',
        error: err
      };
    };
    const result = limiter ? await limiter.schedule(() => __doResolveDestPath()) : await __doResolveDestPath();
    if (result.hasError) {
      task.#doa = {
        msg: result.msg as string,
        cause: result.error
      };
    }
    return task;
  }

  addSuffixToDestPath(suffix: string) {
    if (!this.resolvedDestPath) {
      throw Error('Destination file path not resolved');
    }
    const parts = path.parse(this.resolvedDestPath);
    const newFilename = FSHelper.createFilename({
      name: parts.name,
      suffix,
      ext: parts.ext
    });
    this.resolvedDestPath = path.resolve(parts.dir, newFilename);
  }

  start() {
    if (this.#startPromise) {
      return this.#startPromise;
    }

    if (this.hasEnded()) {
      // Cannot start an ended task
      return Promise.resolve();
    }

    if (this.#doa) {
      this.notifyError(Error(this.#doa.msg, { cause: this.#doa.cause }), false);
      return Promise.resolve();
    }

    this.#startPromise = new Promise<void>((resolve) => {
      void (async () => {
        this.#startingCallback = () => {
          this.#startPromise = null;
          this.#startingCallback = null;
          resolve();
        };
  
        await this.doStart();
  
        // Retry on error, up to `maxRetries`
        while (this.#status === 'pending-retry' && this.#retryCount < this.maxRetries) {
          this.#retryCount++;
          await this.doStart();
        }
      })();
    });

    return this.#startPromise;
  }

  abort() {
    if (this.#abortPromise) {
      return this.#abortPromise;
    }

    this.#abortPromise = new Promise<void>((resolve) => {
      void (async () => {
        if (this.isRunning()) {
          await this.doAbort();
        }
        else if (this.#status === 'pending' || this.#status === 'pending-retry') {
          this.notifyAbort();
        }
        resolve();
      })();
    })
    .finally(() => {
      this.#abortPromise = null;
    });

    return this.#abortPromise;
  }

  getProgress() {
    const progress = this.doGetProgress();
    if (progress === undefined) {
      return this.#lastProgress;
    }
    this.#lastProgress = progress;
    return progress;
  }

  protected notifyStart() {
    this.#status = 'downloading';
    this.#lastProgress = this.getProgress();
    if (this.callbacks?.onStart) {
      this.callbacks.onStart(this);
    }
  }

  protected notifyProgress(progress: DownloadProgress | null) {
    this.#lastProgress = progress;
    if (this.callbacks?.onProgress) {
      this.callbacks.onProgress(this, progress);
    }
  }

  protected notifyComplete() {
    this.#notifyEnd('completed');
  }

  protected notifyAbort() {
    this.#notifyEnd('aborted');
  }

  protected notifySkip(reason: DownloadTaskSkipReason) {
    this.#notifyEnd('skipped', reason);
  }

  protected notifyError(error: any, allowRetry = true) {
    const msg = error instanceof Error ? error.message : error;
    const err = new DownloadTaskError(msg, this);
    if (error instanceof Error) {
      err.cause = error;
    }
    const willRetry = allowRetry && this.#retryCount < this.maxRetries;
    this.#notifyEnd('error', err, willRetry);
  }

  #notifyEnd(status: 'error', err: DownloadTaskError, willRetry: boolean): void;
  #notifyEnd(status: 'skipped', reason: DownloadTaskSkipReason): void;
  #notifyEnd(status: 'aborted'): void;
  #notifyEnd(status: 'completed'): void;
  #notifyEnd(status: 'completed' | 'aborted' | 'skipped' | 'error', ...cbPayload: any[]) {
    this.#status = status;
    let clearCallbacks = true;
    let callStartingCallback = true;
    switch (status) {
      case 'completed':
        if (this.callbacks?.onComplete) {
          this.callbacks.onComplete(this);
        }
        break;
      case 'aborted':
        if (this.callbacks?.onAbort) {
          this.callbacks.onAbort(this);
        }
        break;
      case 'skipped':
        if (this.callbacks?.onSkip) {
          const [ reason ] = cbPayload;
          this.callbacks.onSkip(this, reason);
        }
        break;
      case 'error': {
        const [ err, willRetry ] = cbPayload;
        if (willRetry) {
          this.#status = 'pending-retry';
          clearCallbacks = false;
          callStartingCallback = false;
        }
        if (this.callbacks?.onError) {
          this.callbacks.onError(err, willRetry);
        }
      }
    }

    if (this.#startingCallback && callStartingCallback) {
      this.#startingCallback();
    }

    if (clearCallbacks) {
      this.#callbacks = null;
    }
  }

  isRunning() {
    return this.status === 'downloading';
  }

  isAborting() {
    return !!this.#abortPromise;
  }

  hasEnded() {
    return ENDED_STATUSES.includes(this.#status);
  }

  async setDownloaded(filePath: string) {
    if (!['main', 'thumbnail'].includes(this.downloadType)) {
      return;
    }
    if (!this.#srcEntity.downloaded) {
      this.#srcEntity.downloaded = {};
    }
    const rel =  path.relative(this.#config.outDir, filePath);
    // Replace '\' with '/' - for cross-platform interoperability
    const normalized = rel.replace(/\\/g, '/');
    if (this.downloadType === 'main') {
      this.#srcEntity.downloaded.mimeType = (await fileTypeFromFile(filePath))?.mime?.toLowerCase() || null;
      this.#srcEntity.downloaded.path = normalized;
    }
    else if (this.downloadType === 'thumbnail') {
      if (!this.#srcEntity.downloaded.thumbnail) {
        this.#srcEntity.downloaded.thumbnail = {};
      }
      this.#srcEntity.downloaded.thumbnail.mimeType = (await fileTypeFromFile(filePath))?.mime.toLowerCase() || null;
      this.#srcEntity.downloaded.thumbnail.path =  normalized;
      let size;
      try {
        const buffer = await fs.readFile(filePath);
        size = imageSize(buffer);
      }
      catch (_error) {
        size = null;
      }
      if (size) {
        this.#srcEntity.downloaded.thumbnail.width = size.width;
        this.#srcEntity.downloaded.thumbnail.height = size.height;
      }
    }
  }

  get id() {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get src() {
    return this.#src;
  }

  get resolvedDestFilename() {
    return this.#resolvedDestPath ? path.basename(this.#resolvedDestPath) : null;
  }

  get resolvedDestPath() {
    return this.#resolvedDestPath;
  }

  get doa() {
    return this.#doa;
  }

  protected set resolvedDestPath(value: string | null) {
    this.#resolvedDestPath = value;
  }

  get srcEntity() {
    return this.#srcEntity;
  }

  get downloadType() {
    return this.#downloadType;
  }

  set downloadType(value: 'main' | 'thumbnail' | 'variant') {
    this.#downloadType = value;
  }

  protected get config() {
    return this.#config;
  }

  protected get maxRetries() {
    return this.#config.request.maxRetries;
  }

  protected get dryRun() {
    return this.#config.dryRun;
  }

  get retryCount() {
    return this.#retryCount;
  }

  get status() {
    return this.#status;
  }

  protected set status(value: DownloadTaskStatus) {
    this.#status = value;
  }

  protected get callbacks() {
    return this.#callbacks;
  }

  protected get fsHelper() {
    return this.#fsHelper;
  }

  setCallbacks(value: DownloadTaskCallbacks | null) {
    if (this.status !== 'pending') {
      throw Error('You can only set callbacks of a pending task');
    }
    this.#callbacks = value;
  }

  protected log(level: LogLevel, ...msg: Array<any>) {
    commonLog(this.#logger, level, this.name, ...msg);
  }

  protected get logger() {
    return this.#logger;
  }
}
