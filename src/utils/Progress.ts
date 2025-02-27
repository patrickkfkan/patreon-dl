import { type Response } from 'undici';
import EventEmitter from 'events';
import { Transform, type TransformCallback } from 'stream';
import speedometer from 'speedometer';

export default class Progress extends EventEmitter {

  #stream: Transform;
  #speedometer: speedometer.Speedometer;

  #reportInterval: number;
  #lastReported?: number;
  #startTime?: number;

  #speed: number;
  #percentage?: number;
  #transferred: number;
  #length?: number;
  #remaining?: number;
  #eta?: number;
  #runtime: number;

  constructor(res: Response, opts?: { reportInterval?: number; speed?: number; }) {
    super();
    const contentLength = res.headers.get('content-length');
    this.#length = contentLength !== null ? parseInt(contentLength, 10) : undefined;
    this.#reportInterval = opts?.reportInterval || 0;
    this.#speedometer = speedometer(opts?.speed || 5000);

    this.#stream = new Transform({ transform: this.#transform.bind(this) });
    this.#stream.once('pipe', () => {
      if (!this.#startTime) {
        this.#startTime = Date.now();
      }
    });
    this.#stream.once('end', () => {
      this.#update(null, true);
    });

    this.#speed = 0;
    this.#percentage = 0;
    this.#transferred = 0;
    this.#remaining = 0;
    this.#eta = 0;
    this.#runtime = 0;
  }

  #transform(chunk: any, _encoding: BufferEncoding, callback: TransformCallback) {
    this.#update(chunk);
    callback(null, chunk);
  }

  #update(chunk?: any, forceReport = false) {
    if (chunk) {
      const chunkSize = chunk.length;
      this.#transferred += chunkSize as number;
      this.#speed = this.#speedometer(chunkSize);
      if (this.#length) {
        this.#remaining = Math.max(this.#length - this.#transferred, 0);
        this.#percentage = Math.min(Number((this.#transferred / this.#length * 100).toFixed(2)), 100);
        this.#eta = Math.round(this.#remaining / this.#speed);
      }
    }
    const currentTime = Date.now();
    if (this.#startTime) {
      this.#runtime = Math.floor((currentTime - this.#startTime) / 1000);
    }
    else {
      this.#startTime = currentTime;
      this.#runtime = 0;
    }
    let report = true;
    if (this.#reportInterval > 0 && this.#lastReported) {
      report = currentTime - this.#lastReported >= this.#reportInterval;
    }
    if (report || forceReport) {
      this.#lastReported = currentTime;
      this.emit('progress', this);
    }
  }

  get stream() {
    return this.#stream;
  }

  get percentage() {
    return this.#percentage;
  }

  get transferred() {
    return this.#transferred;
  }

  get length() {
    return this.#length;
  }

  get remaining() {
    return this.#remaining;
  }

  get eta() {
    return this.#eta;
  }

  get runtime() {
    return this.#runtime;
  }

  get speed() {
    return this.#speed;
  }

  emit(eventName: 'progress', src: Progress): boolean;
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }

}
