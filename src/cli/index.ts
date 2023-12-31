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

  constructor() {
    this.#logger = null;
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

    const ytCredsPath = path.resolve(this.#globalConfPath, YT_CREDENTIALS_FILENAME);
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

    const { chainLogger: logger, consoleLogger, fileLoggers } = this.#createLoggers(options);
    this.#logger = logger;

    // Create downloader
    let downloader;
    try {
      downloader = await Downloader.getInstance(options.targetURL, {
        ...options,
        pathToYouTubeCredentials: fs.existsSync(ytCredsPath) ? ytCredsPath : null,
        logger
      });
    }
    catch (error) {
      commonLog(logger, 'error', null, 'Failed to get downloader instance:', error);
      return this.exit(1);
    }

    if (!downloader) {
      commonLog(logger, 'error', null, 'Failed to get downloader instance (unknown reason)');
      return this.exit(1);
    }

    const downloaderName = downloader.name;

    if (!options.noPrompt) {
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

      console.log(`Created ${downloaderName} instance with config: `, downloader.getConfig(), EOL);

      if (!this.#confirmProceed()) {
        console.log('Abort');
        return this.exit(1);
      }
    }
    else {
      commonLog(logger, 'debug', null, `Created ${downloaderName} instance with config: `, downloader.getConfig());
    }

    let hasDownloaderError = false;
    downloader.on('end', ({aborted, error}) => {
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
    });

    try {
      const abortController = new AbortController();
      process.on('SIGINT', () => {
        abortController.abort();
      });
      await downloader.start({ signal: abortController.signal });
      return this.exit(hasDownloaderError ? 1 : 0);
    }
    catch (error) {
      commonLog(logger, 'error', null, `Uncaught ${downloaderName} error:`, error);
      return this.exit(1);
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

  #createLoggers(options: CLIOptions) {
    // Create file loggers
    const fileLoggerInit: FileLoggerInit = {
      targetURL: options.targetURL,
      outDir: options.outDir,
      date: new Date()
    };
    const fileLoggers = options.fileLoggers?.reduce<FileLogger[]>((result, fileLoggerOptions) => {
      try {
        const fl = new FileLogger(fileLoggerInit, fileLoggerOptions);
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
