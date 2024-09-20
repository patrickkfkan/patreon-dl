import fse from 'fs-extra';
import deepEqual from 'deep-equal';
import Innertube, { type OAuth2Tokens, Parser } from 'youtubei.js';
import { JSDOM } from 'jsdom';
import { BG, type BgConfig } from 'bgutils-js';
import { type Logger } from './logging';
import { type LogLevel, commonLog } from './logging/Logger.js';

export default class InnertubeLoader {

  static #name = 'InnertubeLoader';

  static #innertube: Innertube | null = null;
  static #credentialsFile: string | null = null;
  static #credentials: OAuth2Tokens | null = null;
  static #credentialsChanged = false;
  static #logger?: Logger | null;

  static setLogger(logger?: Logger | null) {
    this.#logger = logger;
  }

  static loadCredentials(file: string) {
    const oldCredentials = this.#credentials;
    try {
      this.log('debug', `Load YouTube credentials from "${file}"`);
      this.#credentials = fse.readJSONSync(file);
      this.#credentialsFile = file;
    }
    catch (error) {
      this.#credentials = null;
      this.#credentialsFile = null;
      this.log('error', `Error loading YouTube credentials from "${file}":`, error);
    }
    finally {
      this.#credentialsChanged = !deepEqual(this.#credentials, oldCredentials);
    }
  }

  static async getInstance() {
    let newInstance = false;
    if (!this.#innertube) {
      try {
        const { visitorData, poToken } = await this.#generatePoToken();
        this.#innertube = await Innertube.create({
          po_token: poToken,
          visitor_data: visitorData
        });
      }
      catch (error) {
        this.log('error', 'Failed to get poToken:', error);
        this.log('warn', 'poToken will not be used to create Innertube instance. Downloading YouTube content might fail.');
        this.#innertube = await Innertube.create();
      }

      this.#innertube.session.on('update-credentials', (data) => {
        if (this.#credentialsFile) {
          this.log('debug', 'YouTube credentials updated');
          try {
            fse.writeJsonSync(this.#credentialsFile, data.credentials);
          }
          catch (error) {
            this.log('error', `Error writing updated YouTube credentials to ${this.#credentialsFile}:`, error);
          }
        }
      });

      // Suppress Innertube Parser errors
      Parser.setParserErrorHandler(() => undefined);

      newInstance = true;
    }

    if (newInstance || this.#credentialsChanged) {
      await this.#applyCredentials();
    }

    return this.#innertube;
  }

  /**
   * Required for initializing innertube, otherwise videos will return 403
   * Much of this taken from https://github.com/LuanRT/BgUtils/blob/main/examples/node/index.mjs
   * @returns 
   */
  static async #generatePoToken() {
    this.log('debug', 'Generating poToken...');
    const requestKey = 'O43z0dpjhgX20SCx4KAo';
    const visitorData = (await Innertube.create({ retrieve_player: false })).session.context.client.visitorData;
    if (!visitorData) {
      throw Error('Visitor data not found in session data');
    }

    const bgConfig: BgConfig = {
      fetch: (url, options) => fetch(url, options),
      globalObj: globalThis,
      identifier: visitorData,
      requestKey
    };

    const dom = new JSDOM();
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document
    });

    const challenge = await BG.Challenge.create(bgConfig);
    if (!challenge) {
      throw new Error('Could not get challenge');
    }

    if (challenge.script) {
      const script = challenge.script.find((sc) => sc !== null);
      if (script)
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        new Function(script)();
    }
    else {
      this.log('warn', 'Unable to load Botguard');
    }

    const poToken = await BG.PoToken.generate({
      program: challenge.challenge,
      globalName: challenge.globalName,
      bgConfig
    });

    this.log('debug', 'Obtained poToken:', {
      visitorData,
      poToken
    });

    return {
      visitorData, poToken
    };
  }

  static async #applyCredentials() {
    if (!this.#innertube) {
      return;
    }
    if (this.#innertube.session.logged_in) {
      this.log('debug', 'YouTube - disconnect');
      try {
        await this.#innertube.session.signOut();
      }
      catch (error) {
        this.log('error', 'Failed to sign out of YouTube:', error);
      }
    }
    if (this.#credentials) {
      this.log('debug', 'YouTube - connect');
      try {
        await this.#innertube.session.signIn(this.#credentials);
      }
      catch (error) {
        this.log('error', 'Failed to sign into YouTube:', error);
      }
    }
    this.#credentialsChanged = false;
  }

  protected static log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.#name, ...msg);
  }
}
