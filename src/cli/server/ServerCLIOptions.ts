import { type DeepPartial } from '../../utils/Misc.js';
import CLIOptionValidator from '../CLIOptionValidator.js';
import { type ConsoleLoggerOptions } from '../../utils/logging/ConsoleLogger.js';
import { type FileLoggerOptions, type FileLoggerType } from '../../utils/logging/FileLogger.js';
import { type WebServerConfig } from '../../browse/server/WebServer.js';
import ServerCommandLineParser, { type ServerCommandLineParseResult } from './ServerCommandLineParser.js';

export interface ServerCLIOptions extends DeepPartial<Omit<WebServerConfig, 'logger'>> {
  consoleLogger: ConsoleLoggerOptions;
  fileLogger?: FileLoggerOptions<FileLoggerType.Server>;
}

export type ServerCLIOptionParserEntry = {
  src: 'cli'
  key: string;
  value?: string;
}

export function getServerCLIOptions(): ServerCLIOptions {
  const commandLineOptions = ServerCommandLineParser.parse();

  const { consoleLogger, fileLogger } = getServerCLILoggerOptions(commandLineOptions);

  const options: ServerCLIOptions = {
    dataDir: CLIOptionValidator.validateString(commandLineOptions.dataDir),
    port: CLIOptionValidator.validateNumber(commandLineOptions.port),
    consoleLogger,
    fileLogger
  };

  return options;
}

export function getServerCLILoggerOptions(commandLineOptions?: ServerCommandLineParseResult) {
  if (!commandLineOptions) {
    commandLineOptions = ServerCommandLineParser.parse();
  }

  const logLevel = CLIOptionValidator.validateString(commandLineOptions.logLevel, 'info', 'debug', 'warn', 'error', 'none');
  const enabled = logLevel !== 'none';
  const consoleLogger = {
    enabled,
    logLevel: logLevel !== 'none' ? logLevel : undefined,
  };
  let fileLogger: FileLoggerOptions<FileLoggerType.Server> | undefined = undefined;
  const logFilePath = CLIOptionValidator.validateString(commandLineOptions.logFile);
  if (logFilePath) {
    fileLogger = {
      logLevel: consoleLogger.logLevel,
      logFilePath
    };
  }
  return {
    consoleLogger,
    fileLogger
  };
}