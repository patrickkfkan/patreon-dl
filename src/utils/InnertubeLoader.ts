import fse from 'fs-extra';
import deepEqual from 'deep-equal';
import Innertube, { Credentials, Parser } from 'youtubei.js';
import { Logger } from './logging';
import { LogLevel, commonLog } from './logging/Logger.js';

export default class InnertubeLoader {

  static #name = 'InnertubeLoader';

  static #innertube: Innertube | null = null;
  static #credentialsFile: string | null = null;
  static #credentials: Credentials | null = null;
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
      this.#innertube = await Innertube.create();

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
