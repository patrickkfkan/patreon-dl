import { Progress, ProgressStream } from 'progress-stream';
import { EventEmitter } from 'events';

export type FetcherProgress = Progress & {
  destFilename: string;
  destFilePath: string;
};

export default class FetcherProgressMonitor extends EventEmitter {

  #progressStream: ProgressStream;
  #destFilename: string;
  #destFilePath: string;

  constructor(progressStream: ProgressStream, destFilename: string, destFilePath: string) {
    super();
    this.#progressStream = progressStream;
    this.#destFilename = destFilename;
    this.#destFilePath = destFilePath;

    this.#progressStream.on('progress', this.#handleProgressStreamProgressEvent.bind(this));
  }

  getDestFilename() {
    return this.#destFilename;
  }

  getDestFilePath() {
    return this.#destFilePath;
  }

  getProgress(): FetcherProgress {
    return {
      ...this.#progressStream.progress(),
      destFilename: this.#destFilename,
      destFilePath: this.#destFilePath
    };
  }

  #handleProgressStreamProgressEvent(progress: Progress) {
    this.emit('progress', {
      ...progress,
      destFilename: this.#destFilename,
      destFilePath: this.#destFilePath
    });
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
