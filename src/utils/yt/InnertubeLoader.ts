import Innertube, { Platform } from 'youtubei.js';
import * as InnertubeLib from 'youtubei.js';
import fse from 'fs-extra';
import { type Dispatcher } from 'undici';
import type Logger from '../logging/Logger.js';
import { commonLog, type LogLevel } from '../logging/Logger.js';
import { type DownloaderConfig } from '../../downloaders/Downloader.js';
import { createProxyAgent } from '../Proxy.js';

export interface InnertubeLoaderGetInstanceResult {
  innertube: Innertube;
  getVideoInfo: (videoId: string) => Promise<InnertubeLib.YT.VideoInfo>
};

export default class InnertubeLoader {

  static #name = 'InnertubeLoader';

  static #instanceResult: InnertubeLoaderGetInstanceResult | null = null;
  static #pendingPromise: Promise<InnertubeLoaderGetInstanceResult> | null = null;
  static #logger?: Logger | null;
  static #credentialsFile: string | null = null;
  static #proxy: Dispatcher | undefined = undefined;

  static setLogger(logger?: Logger | null) {
    this.#logger = logger;
  }

  static async getInstance(options: DownloaderConfig<any>) {
    if (this.#instanceResult) {
      return this.#instanceResult;
    }

    if (this.#pendingPromise) {
      return this.#pendingPromise;
    }

    this.log('info', 'Initialize YouTube downloader (this could take some time)')

    if (!this.#proxy) {
      const { agent } = createProxyAgent(options) || {};
      if (agent) {
        this.#proxy = agent;
      }
    }

    this.#pendingPromise = this.#beginInitStage();

    return this.#pendingPromise;
  }

  static #beginInitStage() {
    return new Promise<InnertubeLoaderGetInstanceResult>((resolve) => {
      this.#createInstance(resolve)
        .catch((error: unknown) => {
          this.log('error', 'Error initializing YouTube downloader:', error);
        });
    });
  }

  static async #createInstance(resolve: (value: InnertubeLoaderGetInstanceResult) => void) {
    this.log('debug', 'Create Innertube instance...');
    const credentials = this.#loadCredentials();
    const innertube = await Innertube.create({
      client_type: InnertubeLib.ClientType.TV,
      fetch: (input, init) => Platform.shim.fetch(input, { ...init, dispatcher: this.#proxy } as any)
    });
    if (credentials) {
      const __updateCredentials = (data: any) => {
        if (this.#credentialsFile) {
          this.log('debug', 'YouTube credentials updated');
          try {
            fse.writeJsonSync(this.#credentialsFile, data.credentials);
          }
          catch (error) {
            this.log('error', `Error writing updated YouTube credentials to ${this.#credentialsFile}:`, error);
          }
        }
      };
      try {
        innertube.session.on('update-credentials', __updateCredentials);
        await innertube.session.signIn(credentials);
      }
      catch (error: unknown) {
        this.log('error', 'YouTube sign-in error:', error);
      }
      finally {
        innertube.session.off('update-credentials', __updateCredentials);
      }
      if (innertube.session.logged_in) {
        this.log('debug', 'YouTube signed in');
      }
      else {
        this.log('warn', 'YouTube sign-in failed. Continuing without sign-in.');
      }
    }
   this.#resolveGetInstanceResult(innertube, resolve);
  }

  static #resolveGetInstanceResult(innertube: Innertube, resolve: (value: InnertubeLoaderGetInstanceResult) => void) {
    this.#pendingPromise = null;
    const signedIn = innertube.session.logged_in;
    let getVideoInfoFn: InnertubeLoaderGetInstanceResult['getVideoInfo'];
    getVideoInfoFn = (videoId) => innertube.getBasicInfo(videoId, { client: 'TV'});
    this.#instanceResult = {
      innertube,
      getVideoInfo: getVideoInfoFn
    };
    this.log('info', `YouTube downloader initialized (signed-in: ${signedIn ? 'yes' : 'no'})`);
    resolve(this.#instanceResult);
  }

  static setCredentialsFile(file: string) {
    this.#credentialsFile = file;
  }

  static #loadCredentials() {
    if (!this.#credentialsFile) {
      return null;
    }
    try {
      this.log('debug', `Load YouTube credentials from "${this.#credentialsFile}"`);
      return fse.readJSONSync(this.#credentialsFile);
    }
    catch (error) {
      this.log('error', `Error loading YouTube credentials from "${this.#credentialsFile}":`, error);
      return null;
    }
  }

  protected static log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.#name, ...msg);
  }
}
