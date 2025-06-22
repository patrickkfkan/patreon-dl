import { EOL } from 'os';
import { ConsoleLogger, FileLogger, type Logger, type FileLoggerType, ChainLogger } from '../../utils/logging/index.js';
import { getPackageInfo, type PackageInfo } from '../../utils/PackageInfo.js';
import ServerCommandLineParser from './ServerCommandLineParser.js';
import { getServerCLIOptions, type ServerCLIOptions } from './ServerCLIOptions.js';
import { WebServer } from '../../browse/server/WebServer.js';
import { commonLog } from '../../utils/logging/Logger.js';
import { getLocalIPAddress } from '../../utils/Misc.js';

export default class ServerCLI {

  #logger: Logger | null;
  #packageInfo: PackageInfo;

  constructor() {
    this.#logger = null;
    this.#packageInfo = getPackageInfo();
  }

  async start() {
    if (ServerCommandLineParser.showUsage()) {
      return this.exit(0);
    }

    if (this.#packageInfo.banner) {
      console.log(`${EOL}${this.#packageInfo.banner}${EOL}`);
    }

    const __printOptionError = (error: any) => {
      console.error(
        'Error processing options: ',
        error instanceof Error ? error.message : error,
        EOL,
        'See usage with \'-h\' option.');
      return this.exit(1);
    };
    
    let options;
    try {
      options = getServerCLIOptions();
    }
    catch (error) {
      return __printOptionError(error);
    }

    const { chainLogger: logger, consoleLogger, fileLogger } = this.#createLoggers(options);
    this.#logger = logger;
    this.#printLoggerConfigs(consoleLogger, fileLogger);

    let server;
    try {
      server = new WebServer({
        dataDir: options.dataDir,
        port: options.port,
        logger
      });
    } catch (error) {
      commonLog(
        logger,
        'error',
        null,
        'Failed to create web server instance:',
        error
      );
      return this.exit(1);
    }
    try {
      process.on('SIGINT', () => {
        void (async () => {
          try {
            await server.stop();
            commonLog(logger, 'info', null, 'Web server stopped');
            return await this.exit(0);
          } catch (error) {
            commonLog(
              logger,
              'error',
              null,
              'Failed to stop web server:',
              error
            );
            return this.exit(1);
          }
        })();
      });
      await server.start();
      const ip = getLocalIPAddress();
      commonLog(
        logger,
        'info',
        null,
        `Web server is running on http://${ip}:${server.getConfig().port}`
      );
    } catch (error) {
      commonLog(logger, 'error', null, `Failed to start web server:`, error);
      return this.exit(1);
    }
  }

  #createLoggers(options: ServerCLIOptions) {
    // Create file logger
    const fileLogger = options.fileLogger ? new FileLogger<FileLoggerType.Server>(options.fileLogger) : null;
    
    // Create console logger
    const consoleLogger = new ConsoleLogger(options.consoleLogger);

    // Chain logger
    const chainLogger = new ChainLogger([
      consoleLogger
    ]);
    if (fileLogger) {
      chainLogger.add(fileLogger);
    }

    return {
      chainLogger,
      consoleLogger,
      fileLogger
    };
  }

  #printLoggerConfigs(consoleLogger: ConsoleLogger, fileLogger: FileLogger<FileLoggerType> | null) {
    if (!consoleLogger.getConfig().enabled) {
      console.log('Console logging disabled', EOL);
    }
  
    if (fileLogger) {
      const flConf = fileLogger.getConfig();
      if (flConf.enabled) {
        console.log(`Log file: ${flConf.logLevel}: ${flConf.logFilePath}`);
      }
    }
  };

  async exit(code?: number) {
    if (this.#logger) {
      await this.#logger.end();
    }
    process.exit(code);
  }
}
