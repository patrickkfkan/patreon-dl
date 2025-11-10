import Innertube, { Platform } from 'youtubei.js';
import * as InnertubeLib from 'youtubei.js';
import fse from 'fs-extra';
import { type Dispatcher } from 'undici';
import type Logger from '../logging/Logger.js';
import { commonLog, type LogLevel } from '../logging/Logger.js';
import { type DownloaderConfig } from '../../downloaders/Downloader.js';
import { createProxyAgent } from '../Proxy.js';
import { spawn } from 'child_process';
import ObjectHelper from '../ObjectHelper.js';
import { isDenoInstalled } from '../Misc.js';

export interface InnertubeLoaderGetInstanceResult {
  innertube: Innertube;
  getVideoInfo: (videoId: string) => Promise<InnertubeLib.YT.VideoInfo>
};

Platform.shim.eval = (data: InnertubeLib.Types.BuildScriptResult, env: Record<string, InnertubeLib.Types.VMPrimative>) => {
  const properties = [];

  if(env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`)
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  return InnertubeLoader.eval(code);
};

export default class InnertubeLoader {

  static #name = 'InnertubeLoader';

  static #instanceResult: InnertubeLoaderGetInstanceResult | null = null;
  static #pendingPromise: Promise<InnertubeLoaderGetInstanceResult> | null = null;
  static #logger?: Logger | null;
  static #credentialsFile: string | null = null;
  static #proxy: Dispatcher | undefined = undefined;
  static #pathToDeno: string | null = null;
  static #denoInstalled: boolean | undefined = undefined;

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

    this.#pathToDeno = options.pathToDeno;

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
    this.#instanceResult = {
      innertube,
      getVideoInfo: (videoId) => innertube.getBasicInfo(videoId, { client: 'TV'})
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

  static #evalByDeno(code: string) {
    return new Promise<any>((resolve, reject) => {
      this.log('debug', 'Begin Deno eval');
      const safeCode = code
        .replace(/`/g, '\\`')
        .replace(/\\/g, '\\\\');
      const wrappedCode = `
        try {
          const result = await new Function(\`${safeCode}\`)();
          console.log(JSON.stringify({ result }));
        }
        catch (error) {
          console.log(JSON.stringify({
            result: null,
            error: error instanceof Error ? error.message : String(error)
          }));
        }
      `;
      const denoProcess = spawn(this.#pathToDeno || 'deno', ['eval', wrappedCode]);
      let output = '';

      denoProcess.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      denoProcess.stderr.on('data', (err) => {
        this.log('error', '(stderr) Deno eval:', err.toString());
      });

      denoProcess.on('close', () => {
        try {
          const result = JSON.parse(output.trim());
          const resultValue = ObjectHelper.getProperty(result, 'result');
          const resultErr = ObjectHelper.getProperty(result, 'error');
          if (resultErr) {
            return reject(Error(resultErr));
          }
          this.log('debug', 'Deno eval result:', resultValue);
          return resolve(resultValue);
        } catch (e) {
          return reject(Error('Could not parse result of Deno eval', { cause: e }));
        }
      });
    });
  }

  static eval(code: string) {
    if (this.#denoInstalled === undefined) {
      const denoInstalled = isDenoInstalled(this.#pathToDeno || undefined);
      if (!denoInstalled.installed) {
        if (denoInstalled.error) {
          this.log('warn', 'Deno not found or failed to start:', denoInstalled.error);
        }
        else {
          this.log('warn', 'Deno not found or failed to start');
        }
        this.log('warn', 'No sandboxing available for executed code');
      }
      else {
        this.log('debug', 'Deno found');
      }
      this.#denoInstalled = denoInstalled.installed;
    }

    return this.#denoInstalled ? this.#evalByDeno(code) : this.#unsafeEval(code);
  }

  static #unsafeEval(code: string) {
    this.log('debug', 'Begin unsafe eval');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const result = new Function(code)();
    this.log('debug', 'Unsafe eval result:', result);
    return result;
  }

  static reset() {
    this.#instanceResult = null;
    this.#pendingPromise = null;
    this.#denoInstalled = undefined;
  }

  protected static log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.#name, ...msg);
  }
}
