import { AbortError } from 'node-fetch';

export default class Sleeper {

  #timeout: NodeJS.Timeout | null;
  #resolve: (() => void) | null;
  #signal?: AbortSignal;
  #abortHandler: (() => void) | null;

  #startParams: { ms: number; signal?: AbortSignal };

  constructor() {
    this.#timeout = null;
    this.#resolve = null;
    this.#abortHandler = null;
  }

  static getInstance(ms: number, signal?: AbortSignal) {
    const sleeper = new Sleeper();
    sleeper.#startParams = { ms, signal };
    return sleeper;
  }

  start() {
    const { ms, signal } = this.#startParams;
    return new Promise<void>((resolve, reject) => {
      if (signal) {
        this.#signal = signal;
        this.#abortHandler = () => reject(new AbortError());
        signal.addEventListener('abort', this.#abortHandler, { once: true });
      }
      this.#resolve = resolve;
      this.#timeout = setTimeout(() => this.wake(), ms);
    })
      .finally(() => {
        this.#clear();
      });
  }

  destroy() {
    this.#clear();
  }

  #clear(resolve = false) {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }
    if (this.#signal && this.#abortHandler) {
      this.#signal.removeEventListener('abort', this.#abortHandler);
      this.#abortHandler = null;
      this.#signal = undefined;
    }
    if (this.#resolve && resolve) {
      this.#resolve();
    }
    this.#resolve = null;
  }

  wake() {
    this.#clear(true);
  }
}
