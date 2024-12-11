import Innertube, { YTNodes } from 'youtubei.js';
import BG, { type BgConfig } from 'bgutils-js';
import fse from 'fs-extra';
import { JSDOM } from 'jsdom';
import type Logger from '../logging/Logger.js';
import { commonLog, type LogLevel } from '../logging/Logger.js';

enum Stage {
  Init = '1 - Init',
  PO = '2 - PO',
  Done = '3 - Done'
}

interface POToken {
  params: {
    visitorData?: string;
    identifier: {
      type: 'visitorData' | 'datasyncIdToken';
      value: string;
    };
  }
  value: string;
  ttl?: number;
  refreshThreshold?: number;
}

export default class InnertubeLoader {

  static #name = 'InnertubeLoader';

  static #innertube: Innertube | null = null;
  static #pendingPromise: Promise<Innertube> | null = null;
  static #poTokenRefreshTimer: NodeJS.Timeout | null = null;
  static #logger?: Logger | null;
  static #credentialsFile: string | null = null;

  static setLogger(logger?: Logger | null) {
    this.#logger = logger;
  }

  static async getInstance() {
    if (this.#innertube) {
      return this.#innertube;
    }

    if (this.#pendingPromise) {
      return this.#pendingPromise;
    }

    this.log('info', 'Initialize YouTube downloader (this could take some time)')

    this.#pendingPromise = this.#beginInitStage();

    return this.#pendingPromise;
  }

  static #beginInitStage() {
    return new Promise<Innertube>((resolve) => {
      this.#createInstance(Stage.Init, resolve)
        .catch((error: unknown) => {
          this.log('error', 'Error initializing YouTube downloader:', error);
        });
    });
  }

  static async #beginPOStage(innertube: Innertube, resolve: (value: Innertube) => void, lastToken?: POToken) {
    let identifier: POToken['params']['identifier'] | null = null;
    const visitorData = lastToken?.params.visitorData || innertube.session.context.client.visitorData;
    const lastIdentifier = lastToken?.params.identifier;
    if (lastIdentifier) {
      identifier = lastIdentifier;
    }
    else if (innertube.session.logged_in) {
      this.log('debug', 'Fetch datasyncIdToken')
      const user = await innertube.account.getInfo();
      const accountItemSections = user.page.contents_memo?.getType(YTNodes.AccountItemSection);
      if (accountItemSections) {
        const accountItemSection = accountItemSections.first();
        const accountItem = accountItemSection.contents.first();
        const tokens = accountItem.endpoint.payload.supportedTokens;
        let datasyncIdToken: string | null = null;
        if (Array.isArray(tokens)) {
          datasyncIdToken = tokens.find((v) =>
            typeof v === 'object' &&
            Reflect.has(v, 'datasyncIdToken') &&
            typeof v.datasyncIdToken === 'object' &&
            Reflect.has(v.datasyncIdToken, 'datasyncIdToken') &&
            typeof v.datasyncIdToken.datasyncIdToken === 'string')?.datasyncIdToken.datasyncIdToken;
        }
        identifier = datasyncIdToken ? {
          type: 'datasyncIdToken',
          value: datasyncIdToken
        } : null;
      }
      if (!identifier) {
        this.log('warn', 'YouTube signed in but could not get datasyncIdToken for fetdching po_token');
      }
    }
    else {
      identifier = visitorData ? {
        type: 'visitorData',
        value: visitorData
      } : null;
    }
    let poTokenResult;
    if (identifier) {
      this.log('debug', `Obtaining po_token by ${identifier.type}...`);
      try {
        poTokenResult = await this.#generatePoToken(identifier.value);
        this.log('debug', `Obtained po_token (expires in ${poTokenResult.ttl} seconds)`);
      }
      catch (error: unknown) {
        this.log('error', 'Failed to get poToken:', error);
      }
      if (poTokenResult) {
        this.log('debug', 'Re-create Innertube instance with po_token');
        await this.#createInstance(Stage.PO, resolve, {
          params: {
            visitorData,
            identifier
          },
          value: poTokenResult.token,
          ttl: poTokenResult.ttl,
          refreshThreshold: poTokenResult.refreshThreshold
        })
        return;
      }
    }
    this.log('warn', 'There was an issue initializing YouTube downloader. po_token was not used to create Innertube instance. YouTube downloads might fail.');
    this.#resolveGetInstanceResult(innertube, resolve);
  }

  static async #createInstance(stage: Stage, resolve: (value: Innertube) => void, poToken?: POToken) {
    this.log('debug', `Create Innertube instance${poToken?.value ? ' with po_token' : ''}...`);
    const innertube = await Innertube.create({
      visitor_data: poToken?.params.visitorData,
      po_token: poToken?.value
    });
    const credentials = this.#loadCredentials();
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
    switch (stage) {
      case Stage.Init:
        try {
          await this.#beginPOStage(innertube, resolve);
        }
        catch (error: unknown) {
          this.log('error', 'Error creating Innertube instance (with po_token):', error);
        }
        return;
      case Stage.PO:
        this.#resolveGetInstanceResult(innertube, resolve, poToken);
        break;
    }
  }

  static reset() {
    this.#clearPOTokenRefreshTimer();
    if (this.#pendingPromise) {
      this.#pendingPromise = null;
    }
    this.#innertube = null;
  }

  static #clearPOTokenRefreshTimer() {
    if (this.#poTokenRefreshTimer) {
      clearTimeout(this.#poTokenRefreshTimer);
      this.#poTokenRefreshTimer = null;
    }
  }

  static #resolveGetInstanceResult(innertube: Innertube, resolve: (value: Innertube) => void, poToken?: POToken) {
    this.#pendingPromise = null;
    this.#innertube = innertube;
    this.#clearPOTokenRefreshTimer();
    if (poToken) {
      const { ttl, refreshThreshold = 100 } = poToken;
      if (ttl) {
        const timeout = ttl - refreshThreshold;
        this.log('debug', `Going to refresh po_token in ${timeout} seconds`);
        this.#poTokenRefreshTimer = setTimeout(() => this.#refreshPOToken(poToken), timeout * 1000);
      }
    }
    this.#setTVClientContext(innertube);
    const signedIn = innertube.session.logged_in ? 'yes' : 'no';
    this.log('info', `YouTube downloader initialized (signed-in: ${signedIn})`);
    resolve(innertube);
  }

  static #refreshPOToken(lastToken: POToken) {
    const innertube = this.#innertube;
    if (!innertube) {
      return;
    }
    this.reset();
    this.#pendingPromise = new Promise((resolve) => {
      this.log('debug', 'Refresh po_token');
      this.#beginPOStage(innertube, resolve, lastToken)
        .catch((error: unknown) => {
          this.log('error', 'Error re-initializing YouTube downloader (while refreshing po_token):', error);
        });
    });
  }

  /**
   * Required for initializing innertube, otherwise videos will return 403
   * Much of this taken from https://github.com/LuanRT/BgUtils/blob/main/examples/node/index.ts
   * @returns
   */
  static async #generatePoToken(identifier: string) {
    const requestKey = 'O43z0dpjhgX20SCx4KAo';
    const bgConfig: BgConfig = {
      fetch: (url, options) => fetch(url, options),
      globalObj: globalThis,
      identifier,
      requestKey
    };

    const dom = new JSDOM();
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document
    });

    const bgChallenge = await BG.Challenge.create(bgConfig);
    if (!bgChallenge) {
      throw new Error('Could not get challenge');
    }

    const interpreterJavascript = bgChallenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (interpreterJavascript) {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      new Function(interpreterJavascript)();
    }
    else throw new Error('Could not load VM');

    const poTokenResult = await BG.PoToken.generate({
      program: bgChallenge.program,
      globalName: bgChallenge.globalName,
      bgConfig
    });

    return {
      token: poTokenResult.poToken,
      ttl: poTokenResult.integrityTokenData.estimatedTtlSecs,
      refreshThreshold: poTokenResult.integrityTokenData.mintRefreshThreshold
    };
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

  static #setTVClientContext(innertube: Innertube) {
    innertube.session.context.client = {
      ...innertube.session.context.client,
      clientName: 'TVHTML5',
      clientVersion: '7.20230405.08.01',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36; SMART-TV; Tizen 4.0,gzip(gfe)'
    };
  }

  protected static log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.#name, ...msg);
  }
}