import { DownloaderOptions } from '../downloaders/DownloaderOptions.js';
import { pickDefined } from '../utils/Misc.js';
import { ConsoleLoggerOptions } from '../utils/logging/ConsoleLogger.js';
import { FileLoggerOptions } from '../utils/logging/FileLogger.js';
import CLIOptionValidator from './CLIOptionValidator.js';
import CommandLineParser from './CommandLineParser.js';
import ConfigFileParser from './ConfigFileParser.js';

export interface CLIOptions extends Omit<DownloaderOptions, 'logger'> {
  targetURL: string;
  noPrompt: boolean;
  consoleLogger: ConsoleLoggerOptions;
  fileLoggers?: FileLoggerOptions[];
}

export type CLIOptionParserEntry = ({
  src: 'cli'
} | {
  src: 'cfg',
  section: string
}) & {
  key: string;
  value?: string;
}

export function getCLIOptions(): CLIOptions {
  const commandLineOptions = CommandLineParser.parse();

  const configFileOptions = commandLineOptions.configFile?.value ? ConfigFileParser.parse(commandLineOptions.configFile.value) : null;

  configFileOptions?.include?.previewMedia;

  const options: CLIOptions = {
    targetURL: CLIOptionValidator.validateRequired(pickDefined(commandLineOptions.targetURL, configFileOptions?.targetURL), 'No target URL specified'),
    cookie: CLIOptionValidator.validateString(pickDefined(commandLineOptions.cookie, configFileOptions?.cookie)),
    useStatusCache: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.useStatusCache, configFileOptions?.useStatusCache)),
    pathToFFmpeg: CLIOptionValidator.validateString(pickDefined(commandLineOptions.pathToFFmpeg, configFileOptions?.pathToFFmpeg)),
    outDir: CLIOptionValidator.validateString(pickDefined(commandLineOptions.outDir, configFileOptions?.outDir)),
    dirNameFormat: {
      campaign: CLIOptionValidator.validateString(pickDefined(commandLineOptions.dirNameFormat?.campaign, configFileOptions?.dirNameFormat?.campaign)),
      content: CLIOptionValidator.validateString(pickDefined(commandLineOptions.dirNameFormat?.content, configFileOptions?.dirNameFormat?.content))
    },
    filenameFormat: {
      media: CLIOptionValidator.validateString(pickDefined(commandLineOptions.filenameFormat?.media, configFileOptions?.filenameFormat?.media))
    },
    include: {
      lockedContent: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.lockedContent, configFileOptions?.include?.lockedContent)),
      postsWithMediaType: CLIOptionValidator.validateIncludeContentWithMediaType(pickDefined(commandLineOptions.include?.postsWithMediaType, configFileOptions?.include?.postsWithMediaType)),
      campaignInfo: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.campaignInfo, configFileOptions?.include?.campaignInfo)),
      contentInfo: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.contentInfo, configFileOptions?.include?.contentInfo)),
      previewMedia: CLIOptionValidator.validateIncludePreviewMedia(pickDefined(commandLineOptions.include?.previewMedia, configFileOptions?.include?.previewMedia)),
      contentMedia: CLIOptionValidator.validateIncludeContentMedia(pickDefined(commandLineOptions.include?.contentMedia, configFileOptions?.include?.contentMedia)),
      allMediaVariants: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.allMediaVariants, configFileOptions?.include?.allMediaVariants))
    },
    request: {
      maxRetries: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions?.request?.maxRetries, configFileOptions?.request?.maxRetries)),
      maxConcurrent: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions?.request?.maxConcurrent, configFileOptions?.request?.maxConcurrent)),
      minTime: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions?.request?.minTime, configFileOptions?.request?.minTime))
    },
    fileExistsAction: {
      content: CLIOptionValidator.validateString(pickDefined(commandLineOptions.fileExistsAction?.content, configFileOptions?.fileExistsAction?.content), 'overwrite', 'skip', 'saveAsCopy', 'saveAsCopyIfNewer'),
      info: CLIOptionValidator.validateString(pickDefined(commandLineOptions.fileExistsAction?.info, configFileOptions?.fileExistsAction?.info), 'overwrite', 'skip', 'saveAsCopy', 'saveAsCopyIfNewer'),
      infoAPI: CLIOptionValidator.validateString(pickDefined(commandLineOptions.fileExistsAction?.infoAPI, configFileOptions?.fileExistsAction?.infoAPI), 'overwrite', 'skip', 'saveAsCopy', 'saveAsCopyIfNewer')
    },
    noPrompt: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.noPrompt, configFileOptions?.noPrompt)) || false,
    consoleLogger: {
      enabled: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.consoleLogger?.enabled, configFileOptions?.consoleLogger?.enabled)),
      logLevel: CLIOptionValidator.validateString(pickDefined(commandLineOptions.consoleLogger?.logLevel, configFileOptions?.consoleLogger?.logLevel), 'info', 'debug', 'warn', 'error'),
      include: {
        dateTime: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.consoleLogger?.include?.dateTime, configFileOptions?.consoleLogger?.include?.dateTime)),
        level: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.consoleLogger?.include?.level, configFileOptions?.consoleLogger?.include?.level)),
        originator: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.consoleLogger?.include?.originator, configFileOptions?.consoleLogger?.include?.originator)),
        errorStack: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.consoleLogger?.include?.errorStack, configFileOptions?.consoleLogger?.include?.errorStack))
      },
      dateTimeFormat: CLIOptionValidator.validateString(pickDefined(commandLineOptions.consoleLogger?.dateTimeFormat, configFileOptions?.consoleLogger?.dateTimeFormat)),
      color: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.consoleLogger?.color, configFileOptions?.consoleLogger?.color))
    }
  };

  if (configFileOptions?.fileLoggers) {
    options.fileLoggers = configFileOptions.fileLoggers.map((logger): FileLoggerOptions => ({
      enabled: CLIOptionValidator.validateBoolean(logger.enabled),
      logDir: CLIOptionValidator.validateString(logger.logDir),
      logFilename: CLIOptionValidator.validateString(logger.logFilename),
      fileExistsAction: CLIOptionValidator.validateString(logger.fileExistsAction, 'append', 'overwrite'),
      logLevel: CLIOptionValidator.validateString(logger.logLevel, 'info', 'debug', 'warn', 'error'),
      include: {
        dateTime: CLIOptionValidator.validateBoolean(logger.include?.dateTime),
        level: CLIOptionValidator.validateBoolean(logger.include?.level),
        originator: CLIOptionValidator.validateBoolean(logger.include?.originator),
        errorStack: CLIOptionValidator.validateBoolean(logger.include?.errorStack)
      },
      dateTimeFormat: CLIOptionValidator.validateString(logger.dateTimeFormat),
      color: CLIOptionValidator.validateBoolean(logger.color)
    }));
  }

  return options;
}
