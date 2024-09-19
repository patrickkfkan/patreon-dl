import { EventEmitter } from 'events';
import Progress from './Progress';

export type FetcherProgress = {
  speed: number;
  percentage?: number;
  transferred: number;
  length?: number;
  remaining?: number;
  eta?: number;
  runtime: number;
  destFilename: string;
  destFilePath: string;
};

export default class FetcherProgressMonitor extends EventEmitter {

  #progress: Progress;
  #destFilename: string;
  #destFilePath: string;

  constructor(progress: Progress, destFilename: string, destFilePath: string) {
    super();
    this.#progress = progress;
    this.#destFilename = destFilename;
    this.#destFilePath = destFilePath;

    this.#progress.on('progress', this.#handleProgressStreamProgressEvent.bind(this));
  }

  getDestFilename() {
    return this.#destFilename;
  }

  getDestFilePath() {
    return this.#destFilePath;
  }

  getProgress(): FetcherProgress {
    return {
      speed: this.#progress.speed,
      percentage: this.#progress.percentage,
      transferred: this.#progress.transferred,
      length: this.#progress.length,
      remaining: this.#progress.remaining,
      eta: this.#progress.eta,
      runtime: this.#progress.runtime,
      destFilename: this.#destFilename,
      destFilePath: this.#destFilePath
    };
  }

  #handleProgressStreamProgressEvent() {
    this.emit('progress', this.getProgress());
  }

  emit(event: 'progress', progress: FetcherProgress): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  on(event: 'progress', listener: (progress: FetcherProgress) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once(event: 'progress', listener: (progress: FetcherProgress) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }
}
