import path from 'path';
import { Downloadable } from '../../entities/Downloadable.js';
import Logger, { LogLevel, commonLog } from '../../utils/logging/Logger.js';

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
  name: 'other';
})

export interface DownloadProgress {
  destFilename: string;
  destFilePath: string;
  lengthUnit: string;
  length: number; // Measured in `lengthUnit`
  lengthDownloaded: number; // Measured in `lengthUnit`
  percent: number;
  sizeDownloaded: number; // Kb
  speed: number; // Kb/s
}

export interface DownloadTaskParams<T extends Downloadable = Downloadable> {
  src: string;
  srcEntity: T,
  maxRetries: number;
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
  #src: string;
  #maxRetries: number;
  #retryCount: number;
  #resolvedDestPath: string | null;
  #srcEntity: T;
  #callbacks: DownloadTaskCallbacks | null;
  #logger?: Logger | null;
  #lastProgress: DownloadProgress | null;
  #status: DownloadTaskStatus;

  #startPromise: Promise<void> | null;
  #startingCallback: (() => void) | null;
  #abortPromise: Promise<void> | null;

  constructor(params: DownloadTaskParams<T>) {
    this.#id = DownloadTask.#idCounter;
    this.#src = params.src;
    this.#maxRetries = params.maxRetries;
    this.#retryCount = 0;
    this.#resolvedDestPath = null;
    this.#srcEntity = params.srcEntity;
    this.#callbacks = params.callbacks;
    this.#logger = params.logger;
    this.#lastProgress = null;
    this.#status = 'pending';
    this.#startPromise = null;
    this.#startingCallback = null;
    this.#abortPromise = null;

    DownloadTask.#idCounter++;
  }

  protected abstract doStart(): Promise<void>;
  protected abstract doAbort(): Promise<void>;
  protected abstract doDestroy(): Promise<void>;
  protected abstract doGetProgress(): DownloadProgress | null | undefined;

  start() {
    if (this.#startPromise) {
      return this.#startPromise;
    }

    if (this.hasEnded()) {
      // Cannot start an ended task
      return Promise.resolve();
    }

    this.#startPromise = new Promise<void>(async (resolve) => {
      this.#startingCallback = () => {
        this.#startPromise = null;
        this.#startingCallback = null;
        resolve();
      };

      await this.doStart();

      // Retry on error, up to `maxRetries`
      while (this.#status === 'pending-retry' && this.#retryCount < this.#maxRetries) {
        this.#retryCount++;
        await this.doStart();
      }
    });

    return this.#startPromise;
  }

  abort() {
    if (this.#abortPromise) {
      return this.#abortPromise;
    }

    this.#abortPromise = new Promise<void>(async (resolve) => {
      if (this.isRunning()) {
        await this.doAbort();
      }
      else if (this.#status === 'pending' || this.#status === 'pending-retry') {
        this.notifyAbort();
      }
      resolve();
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

  protected notifyError(error: any) {
    const msg = error instanceof Error ? error.message : error;
    const err = new DownloadTaskError(msg, this);
    if (error instanceof Error) {
      err.cause = error;
    }
    const willRetry = this.#retryCount < this.#maxRetries;
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
      case 'error':
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

  protected set resolvedDestPath(value: string | null) {
    this.#resolvedDestPath = value;
  }

  get srcEntity() {
    return this.#srcEntity;
  }

  protected get maxRetries() {
    return this.#maxRetries;
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
