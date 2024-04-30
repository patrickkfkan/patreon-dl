import { EOL } from 'os';
import PromptSync from 'prompt-sync';
import path from 'path';
import fs from 'fs';
import Downloader from '../downloaders/Downloader.js';
import ConsoleLogger from '../utils/logging/ConsoleLogger.js';
import { CLIOptions, getCLIOptions } from './CLIOptions.js';
import CommandLineParser from './CommandLineParser.js';
import Logger, { commonLog } from '../utils/logging/Logger.js';
import FileLogger, { FileLoggerInit } from '../utils/logging/FileLogger.js';
import ChainLogger from '../utils/logging/ChainLogger.js';
import { PackageInfo, getPackageInfo } from '../utils/PackageInfo.js';
import envPaths from 'env-paths';
import YouTubeConfigurator from './helper/YouTubeConfigurator.js';

const YT_CREDENTIALS_FILENAME = 'youtube-credentials.json';

export default class PatreonDownloaderCLI {

  #logger: Logger | null;
  #packageInfo: PackageInfo;
  #globalConfPath: string;
  // Keep track of file loggers created, so that we force 'append' mode if
  // Multiple target URLs share the same log file.
  #fileLoggers: FileLogger[];

  constructor() {
    this.#logger = null;
    this.#fileLoggers = [];
    this.#packageInfo = getPackageInfo();
    this.#globalConfPath = envPaths(
      this.#packageInfo.name || 'patreon-dl', { suffix: '' }).config;
  }

  async start() {
    if (CommandLineParser.showUsage()) {
      return this.exit(0);
    }

    if (this.#packageInfo.banner) {
      console.log(`${EOL}${this.#packageInfo.banner}${EOL}`);
    }

    const ytCredsPath = this.#getYouTubeCredentialsPath();
    if (CommandLineParser.configureYouTube()) {
      return this.exit(await YouTubeConfigurator.start(ytCredsPath));
    }

    let options;
    try {
      options = getCLIOptions();
    }
    catch (error) {
      console.error(
        'Error processing options: ',
        error instanceof Error ? error.message : error,
        EOL,
        'See usage with \'-h\' option.');
      return this.exit(1);
    }

    const targetsWithError: string[] = [];
    const targetEndMessages: { url: string; message: string; }[] = [];
    for (let i = 0; i < options.targetURLs.length; i++) {
      const { hasError, aborted, endMessage } = await this.#createAndStartDownloader(options.targetURLs, i, options);
      if (aborted) {
        return this.exit(1);
      }
      if (hasError) {
        targetsWithError.push(options.targetURLs[i]);
      }
      targetEndMessages[i] = { url: options.targetURLs[i], message: endMessage };
    }
    if (options.targetURLs.length > 0) {
      // Print summary
      console.log('');
      const heading = `Total ${options.targetURLs.length} targets processed`;
      console.log(heading);
      console.log('-'.repeat(heading.length));
      console.log('');
      targetEndMessages.forEach(({ url, message }, i) => {
        const s = `${i}: ${url}`;
        console.log(s);
        console.log(message);
        console.log('');
      });
    }
    if (targetsWithError.length > 0) {
      if (options.targetURLs.length > 0) {
        console.warn('There were errors processing the following URLs:', JSON.stringify(targetsWithError, null, 2));
      }
      return this.exit(1);
    }
    return this.exit(0);
  }

  #getYouTubeCredentialsPath() {
    return path.resolve(this.#globalConfPath, YT_CREDENTIALS_FILENAME);
  }

  async #createAndStartDownloader(targetURLs: string[], index: number, options: CLIOptions) {
    const targetURL = targetURLs[index];
    // Create loggers
    const { chainLogger: logger, consoleLogger, fileLoggers } = this.#createLoggers(targetURL, options);
    this.#logger = logger;

    // Create downloader
    let downloader: Downloader<any>;
    const ytCredsPath = this.#getYouTubeCredentialsPath();
    try {
      downloader = await Downloader.getInstance(targetURL, {
        ...options,
        pathToYouTubeCredentials: fs.existsSync(ytCredsPath) ? ytCredsPath : null,
        logger: this.#logger
      });
    }
    catch (error) {
      commonLog(logger, 'error', null, 'Failed to get downloader instance:', error);
      return { hasError: true, endMessage: 'Downloader init error' };
    }

    if (!downloader) {
      commonLog(logger, 'error', null, 'Failed to get downloader instance (unknown reason)');
      return { hasError: true, endMessage: 'Downloader init error' };
    }

    const downloaderName = downloader.name;
    const __logBegin = () => {
      commonLog(logger, 'info', null, `*** BEGIN target URL: ${targetURL} ***`, EOL);
    };

    if (!options.noPrompt) {

      const __printLoggerConfigs = () => {
        if (!consoleLogger.getConfig().enabled) {
          console.log('Console logging disabled', EOL);
        }

        if (fileLoggers.length > 0) {
          console.log('Log files');
          console.log('---------');
          for (const fl of fileLoggers) {
            const flConf = fl.getConfig();
            console.log(`- ${flConf.logLevel}: ${flConf.logFilePath}`);
          }
          console.log(EOL);
        }
      };

      const __printDownloaderCreated = () => {
        console.log(`Created ${downloaderName} instance with config: `, downloader.getConfig(), EOL);
      };

      let promptConfirm = true;
      let postConfirm: (() => void) | null = null;

      if (targetURLs.length === 1) {
        __printLoggerConfigs();
        __printDownloaderCreated();
      }
      else if (index === 0) {
        postConfirm = () => {
          __logBegin();
          __printLoggerConfigs();
          __printDownloaderCreated();
        };
        const conf = {
          targetURLs,
          ...downloader.getConfig()
        } as any;
        delete conf.targetURL;
        delete conf.type;
        delete conf.postFetch;
        delete conf.productId;
        delete conf.outDir;
        console.log('Downloader config:', conf, EOL);
      }
      else {
        __logBegin();
        __printLoggerConfigs();
        __printDownloaderCreated();
        promptConfirm = false;
      }
      if (promptConfirm && !this.#confirmProceed()) {
        console.log('Abort');
        return { aborted: true, endMessage: 'Aborted' };
      }
      if (postConfirm) {
        postConfirm();
      }
    }
    else {
      __logBegin();
      commonLog(logger, 'debug', null, `Created ${downloaderName} instance with config: `, downloader.getConfig());
    }

    let hasDownloaderError = false;
    let endMessage = '';
    downloader.on('end', ({ aborted, error, message }) => {
      if (aborted) {
        commonLog(logger, 'info', null, `${downloaderName} aborted`);
      }
      else if (!error) {
        commonLog(logger, 'info', null, `${downloaderName} end`);
      }
      else {
        commonLog(logger, 'warn', null, `${downloaderName} end with error`);
        hasDownloaderError = true;
      }
      endMessage = message;
    });

    try {
      const abortController = new AbortController();
      const abortHandler = () => {
        abortController.abort();
      };
      process.on('SIGINT', abortHandler);
      await downloader.start({ signal: abortController.signal });
      await logger.end();
      process.off('SIGINT', abortHandler);
      return { hasError: hasDownloaderError, endMessage };
    }
    catch (error) {
      commonLog(logger, 'error', null, `Uncaught ${downloaderName} error:`, error);
      return { hasError: true, endMessage: 'Uncaught error' };
    }
  }

  #confirmProceed(prompt?: PromptSync.Prompt): boolean {
    if (!prompt) {
      prompt = PromptSync({ sigint: true });
    }
    const confirmProceed = prompt('Proceed (Y/n)? ');
    if (!confirmProceed.trim() || confirmProceed.trim().toLowerCase() === 'y') {
      return true;
    }
    else if (confirmProceed.trim().toLowerCase() === 'n') {
      return false;
    }

    return this.#confirmProceed(prompt);
  }

  #createLoggers(targetURL: string, options: CLIOptions) {
    // Create file loggers
    const fileLoggerInit: FileLoggerInit = {
      targetURL,
      outDir: options.outDir,
      date: new Date()
    };
    const fileLoggers = options.fileLoggers?.reduce<FileLogger[]>((result, fileLoggerOptions) => {
      try {
        const { filePath } = FileLogger.getPathInfo({
          ...fileLoggerInit,
          ...fileLoggerOptions
        });
        const existingFileLogger = this.#fileLoggers.find((logger) => logger.getConfig().logFilePath === filePath);
        const fl = existingFileLogger || new FileLogger(fileLoggerInit, fileLoggerOptions);
        result.push(fl);
      }
      catch (error) {
        console.warn('Failed to create file logger: ', error instanceof Error ? error.message : error);
      }
      return result;
    }, []) || [];

    // Create console logger
    const consoleLogger = new ConsoleLogger(options.consoleLogger);

    // Chain logger
    const chainLogger = new ChainLogger([
      consoleLogger,
      ...fileLoggers
    ]);

    return {
      chainLogger,
      consoleLogger,
      fileLoggers
    };
  }

  async exit(code?: number) {
    if (this.#logger) {
      await this.#logger.end();
    }
    process.exit(code);
  }
}
