import EventEmitter from 'events';
import Innertube, { type OAuth2Tokens } from 'youtubei.js';

export interface YouTubeCredentialsPendingInfo {
  verificationURL: string;
  code: string;
}

export default class YouTubeCredentialsCapturer extends EventEmitter {

  #innertube: Innertube | null;
  #innertubeAuthListeners: {
    authPending: (data: any) => void;
    auth: (data: any) => void;
  };

  constructor() {
    super();
    this.#innertube = null;
    this.#innertubeAuthListeners = {
      authPending: this.#handleInnertubeAuthPendingEvent.bind(this),
      auth: this.#handleInnertubeAuthEvent.bind(this)
    };
  }

  async begin() {
    const innertube = await Innertube.create();
    innertube.session.on('auth-pending', this.#innertubeAuthListeners.authPending);
    innertube.session.on('auth', this.#innertubeAuthListeners.auth);
    void innertube.session.signIn();
  }

  abort() {
    if (this.#innertube) {
      this.#innertube.session.off('auth-pending', this.#innertubeAuthListeners.authPending);
      this.#innertube.session.off('auth', this.#innertubeAuthListeners.auth);
    }
  }

  #handleInnertubeAuthPendingEvent(data: any) {
    const verificationURL = data.verification_url;
    const code = data.user_code;
    this.emit('pending', ({ verificationURL, code }));
  }

  #handleInnertubeAuthEvent(data: { credentials: OAuth2Tokens }) {
    this.emit('capture', data.credentials);
  }

  on(eventName: 'pending', listener: (data: YouTubeCredentialsPendingInfo) => void): this;
  on(eventName: 'capture', listener: (credentials: object) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  once(eventName: 'pending', listener: (data: YouTubeCredentialsPendingInfo) => void): this;
  once(eventName: 'capture', listener: (credentials: object) => void): this;
  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(eventName, listener);
  }

  off(eventName: 'pending', listener: (data: YouTubeCredentialsPendingInfo) => void): this;
  off(eventName: 'capture', listener: (credentials: object) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(eventName, listener);
  }

  emit(eventName: 'pending', data: YouTubeCredentialsPendingInfo): boolean;
  emit(eventName: 'capture', credentials: object): boolean;
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }
}
