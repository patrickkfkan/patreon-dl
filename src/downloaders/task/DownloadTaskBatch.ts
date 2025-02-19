import Bottleneck from 'bottleneck';
import {type DownloadTaskError, type DownloadProgress, type DownloadTaskStatus, type DownloadTaskSkipReason, type IDownloadTask} from './DownloadTask.js';
import type DownloadTask from './DownloadTask.js';
import type Fetcher from '../../utils/Fetcher.js';
import EventEmitter from 'events';
import { type DownloadTaskBatchEvent, type DownloadTaskBatchEventPayloadOf } from './DownloadTaskBatchEvent.js';
import {type LogLevel} from '../../utils/logging/Logger.js';
import type Logger from '../../utils/logging/Logger.js';
import { commonLog } from '../../utils/logging/Logger.js';

export interface DownloadTaskBatchParams {
  name: string;
  fetcher: Fetcher;
  limiter: {
    maxConcurrent: number;
    minTime: number;
  };
  logger?: Logger | null;
}

export interface IDownloadTaskBatch extends EventEmitter {
  id: number;
  name: string;
  allTasksEnded: () => boolean;
  hasErrors: () => boolean;
  isDestroyed: () => boolean;
  isAborted: () => boolean;
  getTasks: (status?: DownloadTaskStatus) => IDownloadTask[];
  on<T extends DownloadTaskBatchEvent>(event: T, listener: (args: DownloadTaskBatchEventPayloadOf<T>) => void): this;
  once<T extends DownloadTaskBatchEvent>(event: T, listener: (args: DownloadTaskBatchEventPayloadOf<T>) => void): this;
  off<T extends DownloadTaskBatchEvent>(event: T, listener: (args: DownloadTaskBatchEventPayloadOf<T>) => void): this;
}

export default class DownloadTaskBatch extends EventEmitter implements IDownloadTaskBatch {

  static #idCounter = 0;

  #id: number;
  #taskIdCounter: number;
  #name: string;
  #tasks: DownloadTask[];
  #limiter: Bottleneck;
  #logger?: Logger | null;
  #startPromise: Promise<void> | null;
  #startingCallback?: (() => void) | null;
  #abortPromise: Promise<void> | null;
  #destroyPromise: Promise<void> | null;
  #destroyed: boolean;
  #aborted: boolean;

  constructor(params: DownloadTaskBatchParams) {
    super();
    this.#limiter = new Bottleneck({
      maxConcurrent: params.limiter.maxConcurrent,
      minTime: params.limiter.minTime
    });
    this.#id = DownloadTaskBatch.#idCounter;
    this.#taskIdCounter = 0;
    this.#name = params.name;
    this.#tasks = [];
    this.#logger = params.logger;
    this.#startPromise = null;
    this.#startingCallback = null;
    this.#abortPromise = null;
    this.#destroyPromise = null;
    this.#destroyed = false;

    DownloadTaskBatch.#idCounter++;
  }

  #reassignTaskId(task: DownloadTask) {
    task.id = this.#taskIdCounter;
    this.#taskIdCounter++;
  }

  addTasks(tasks: DownloadTask[]) {
    for (const task of tasks) {
      this.#reassignTaskId(task);

      task.setCallbacks({
        onStart: (task: DownloadTask) => {
          this.emit('taskStart', { task });
        },
        onProgress: (task: DownloadTask, progress: DownloadProgress | null) => {
          this.emit('taskProgress', { task, progress });
        },
        onComplete: (task: DownloadTask) => {
          this.emit('taskComplete', { task });
          this.#checkAndCallbackBatchComplete();
        },
        onAbort: (task: DownloadTask) => {
          this.emit('taskAbort', { task });
          this.#checkAndCallbackBatchComplete();
        },
        onSkip: (task: DownloadTask, reason: DownloadTaskSkipReason) => {
          this.emit('taskSkip', { task, reason });
          this.#checkAndCallbackBatchComplete();
        },
        onError: (error: DownloadTaskError, willRetry: boolean) => {
          this.emit('taskError', { error, willRetry });
          if (!willRetry) {
            this.#checkAndCallbackBatchComplete();
          }
        },
        onSpawn: (origin: DownloadTask, spawn: DownloadTask) => {
          if (!this.isAborted() && !this.isDestroyed()) {
            this.#reassignTaskId(spawn);
            this.#tasks.push(spawn);
            void this.#limiter.schedule(() => spawn.start());
            this.emit('taskSpawn', { origin, spawn });
            void spawn.start();
          }
        }
      });
    }
    this.#tasks.push(...tasks);
  }

  prestart() {
    this.#resolveConflictingDestPaths();
  }

  start() {
    if (this.isAborted()) {
      throw Error('Cannot start aborted task batch');
    }
    if (this.isDestroyed()) {
      throw Error('Cannot start a destroyed task batch');
    }

    if (this.#startPromise) {
      return this.#startPromise;
    }

    this.#startPromise = new Promise<void>((resolve) => {
      this.#startingCallback = () => {
        this.#startPromise = null;
        this.#startingCallback = null;
        resolve();
      };
      if (this.#tasks.length > 0) {
        for (const task of this.#tasks) {
          void this.#limiter.schedule(() => task.start());
        }
      }
      else {
        // This will cause promise to resolve right away
        this.#checkAndCallbackBatchComplete();
      }
    });

    return this.#startPromise;
  }

  #resolveConflictingDestPaths() {
    const tasks = this.#tasks.filter((task) => !task.doa && task.resolvedDestPath);
    if (tasks.length === 0) {
      return;
    }
    this.log('debug', `Resolve conflicting dest paths (${tasks.length} tasks)`);
    for (const t of tasks) {
      const dup = tasks.filter((task) => task.resolvedDestPath === t.resolvedDestPath);
      if (dup.length > 1) {
        this.log('debug', `${dup.length} tasks have same dest path "${t.resolvedDestPath}"`);
        dup.forEach((task) => {
          task.addSuffixToDestPath(` - ${task.srcEntity.id}`);
          this.log('debug', `(#${this.id}.${task.id}): Override dest path -> "${task.resolvedDestPath}"`);
        });
      }
    }
  }

  #checkAndCallbackBatchComplete() {
    if (this.allTasksEnded()) {
      this.emit('complete', {});
      if (this.#startingCallback) {
        this.#startingCallback();
      }
    }
  }

  async destroy() {
    if (this.#destroyPromise) {
      return this.#destroyPromise;
    }

    this.#destroyPromise = new Promise<void>((resolve) => {
      void (async () => {
        await this.abort();
        this.removeAllListeners();
        this.#tasks = [];
        this.#destroyPromise = null;
        this.#destroyed = true;
        resolve();
      })();
    });

    return this.#destroyPromise;
  }

  allTasksEnded() {
    return this.#tasks.every((task) => task.hasEnded());
  }

  hasErrors() {
    return this.#tasks.some((task) => task.status === 'error');
  }

  isDestroyed() {
    return this.#destroyed || !!this.#destroyPromise;
  }

  isAborted() {
    return this.#aborted || !!this.#abortPromise;
  }

  getTasks(status?: DownloadTaskStatus) {
    if (!status) {
      return this.#tasks;
    }
    return this.#tasks.filter((task) => task.status === status);
  }

  async abort() {
    if (this.#abortPromise) {
      return this.#abortPromise;
    }

    if (this.isAborted()) {
      return Promise.resolve();
    }

    this.#abortPromise = new Promise((resolve) => {
      void (async () => {
        const abortPromises = this.#tasks.map((task) => task.abort());
        await Promise.all(abortPromises);
        this.#aborted = true;
        this.#abortPromise = null;
        resolve();
      })();
    });

    return this.#abortPromise;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get limiter() {
    return this.#limiter;
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.name, ...msg);
  }

  on<T extends DownloadTaskBatchEvent>(event: T, listener: (args: DownloadTaskBatchEventPayloadOf<T>) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once<T extends DownloadTaskBatchEvent>(event: T, listener: (args: DownloadTaskBatchEventPayloadOf<T>) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  off<T extends DownloadTaskBatchEvent>(event: T, listener: (args: DownloadTaskBatchEventPayloadOf<T>) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  emit<T extends DownloadTaskBatchEvent>(event: T, args: DownloadTaskBatchEventPayloadOf<T>): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}
