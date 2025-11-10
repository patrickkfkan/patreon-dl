import fs from 'fs';
import { type DownloaderIncludeOptions, type DownloaderOptions } from '../downloaders/DownloaderOptions.js';
import { type DeepPartial, type RecursivePropsTo, pickDefined } from '../utils/Misc.js';
import { type ConsoleLoggerOptions } from '../utils/logging/ConsoleLogger.js';
import { type FileLoggerType, type FileLoggerOptions } from '../utils/logging/FileLogger.js';
import CLIOptionValidator from './CLIOptionValidator.js';
import CommandLineParser, { type CommandLineParseResult } from './CommandLineParser.js';
import ConfigFileParser, { type ConfigFileParseResult } from './ConfigFileParser.js';
import path from 'path';
import ObjectHelper from '../utils/ObjectHelper.js';

export interface CLITargetURLEntry {
  url: string;
  // Target-specific 'include' options
  include?: DownloaderIncludeOptions;
}

export interface CLIOptions extends Omit<DownloaderOptions, 'logger'> {
  targetURLs: CLITargetURLEntry[];
  noPrompt: boolean;
  consoleLogger: ConsoleLoggerOptions;
  fileLoggers?: Omit<FileLoggerOptions<FileLoggerType.Downloader>, 'init'>[];
}

export type CLIOptionParserEntry = ({
  src: 'cli'
} | {
  src: 'cfg',
  section: string
} | {
  src: 'tgt',
  line: number
}) & {
  key: string;
  value?: string;
}

export function getCLIOptions(skipTargetURLs: true): Omit<CLIOptions, 'targetURLs'>;
export function getCLIOptions(skipTargetURLs?: false): CLIOptions;
export function getCLIOptions(skipTargetURLs = false): CLIOptions | Omit<CLIOptions, 'targetURLs'> {
  const commandLineOptions = CommandLineParser.parse();

  const configFileOptions = commandLineOptions.configFile?.value ? ConfigFileParser.parse(commandLineOptions.configFile.value) : null;

  let targetURLs: CLITargetURLEntry[] = [];
  if (!skipTargetURLs) {
    const targetURLValue = CLIOptionValidator.validateRequired(pickDefined(commandLineOptions.targetURLs, configFileOptions?.targetURLs), 'No target URL specified');
    const targetsFile = path.resolve(targetURLValue);
    if (fs.existsSync(targetsFile)) {
      targetURLs = readTargetsFile(targetsFile);
    }
    else {
      targetURLs = CLIOptionValidator
        .validateTargetURLs(targetURLValue)
        .map((url) => ({ url }));
    }
  }

  const { consoleLogger, fileLoggers } = getCLILoggerOptions(commandLineOptions, configFileOptions);
  const proxy = getProxyOptions(configFileOptions);

  const options = {
    cookie: CLIOptionValidator.validateString(pickDefined(commandLineOptions.cookie, configFileOptions?.cookie)),
    useStatusCache: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.useStatusCache, configFileOptions?.useStatusCache)),
    stopOn: CLIOptionValidator.validateString(pickDefined(commandLineOptions.stopOn, configFileOptions?.stopOn), 'never', 'postPreviouslyDownloaded', 'postPublishDateOutOfRange'),
    pathToFFmpeg: CLIOptionValidator.validateString(pickDefined(commandLineOptions.pathToFFmpeg, configFileOptions?.pathToFFmpeg)),
    pathToDeno: CLIOptionValidator.validateString(pickDefined(commandLineOptions.pathToDeno, configFileOptions?.pathToDeno)),
    outDir: CLIOptionValidator.validateString(pickDefined(commandLineOptions.outDir, configFileOptions?.outDir)),
    dirNameFormat: {
      campaign: CLIOptionValidator.validateString(pickDefined(commandLineOptions.dirNameFormat?.campaign, configFileOptions?.dirNameFormat?.campaign)),
      content: CLIOptionValidator.validateString(pickDefined(commandLineOptions.dirNameFormat?.content, configFileOptions?.dirNameFormat?.content))
    },
    filenameFormat: {
      media: CLIOptionValidator.validateString(pickDefined(commandLineOptions.filenameFormat?.media, configFileOptions?.filenameFormat?.media))
    },
    include: getCLIIncludeOptions(commandLineOptions, configFileOptions),
    request: {
      maxRetries: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions?.request?.maxRetries, configFileOptions?.request?.maxRetries)),
      maxConcurrent: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions?.request?.maxConcurrent, configFileOptions?.request?.maxConcurrent)),
      minTime: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions?.request?.minTime, configFileOptions?.request?.minTime)),
      proxy,
      userAgent: CLIOptionValidator.validateString(pickDefined(commandLineOptions?.request?.userAgent, configFileOptions?.request?.userAgent))
    },
    fileExistsAction: {
      content: CLIOptionValidator.validateString(pickDefined(commandLineOptions.fileExistsAction?.content, configFileOptions?.fileExistsAction?.content), 'overwrite', 'skip', 'saveAsCopy', 'saveAsCopyIfNewer'),
      info: CLIOptionValidator.validateString(pickDefined(commandLineOptions.fileExistsAction?.info, configFileOptions?.fileExistsAction?.info), 'overwrite', 'skip', 'saveAsCopy', 'saveAsCopyIfNewer'),
      infoAPI: CLIOptionValidator.validateString(pickDefined(commandLineOptions.fileExistsAction?.infoAPI, configFileOptions?.fileExistsAction?.infoAPI), 'overwrite', 'skip', 'saveAsCopy', 'saveAsCopyIfNewer')
    },
    embedDownloaders: getEmbedDownloaderOptions(configFileOptions),
    maxVideoResolution: CLIOptionValidator.validateNumber(pickDefined(commandLineOptions.maxVideoResolution, configFileOptions?.maxVideoResolution)),
    noPrompt: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.noPrompt, configFileOptions?.noPrompt)) || false,
    dryRun: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.dryRun, configFileOptions?.dryRun)) || false,
    consoleLogger,
    fileLoggers
  } satisfies Omit<CLIOptions, 'targetURLs'>;

  if (skipTargetURLs) {
    return options;
  }

  return {
    targetURLs,
    ...options
  } satisfies CLIOptions;
}

export function getCLILoggerOptions(commandLineOptions?: CommandLineParseResult, configFileOptions?: ReturnType<typeof ConfigFileParser['parse']> | null) {
  if (!commandLineOptions) {
    commandLineOptions = CommandLineParser.parse();
  }
  const consoleLogger = {
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
  };
  let fileLoggers;
  if (configFileOptions?.fileLoggers) {
    fileLoggers = configFileOptions.fileLoggers.map((logger): Omit<FileLoggerOptions<FileLoggerType.Downloader>, 'init'> => ({
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
  return {
    consoleLogger,
    fileLoggers
  };
}

function getCLIIncludeOptions(commandLineOptions: CommandLineParseResult, configFileOptions?: ConfigFileParseResult | null) {
  if (!commandLineOptions) {
    commandLineOptions = CommandLineParser.parse();
  }
  return {
    lockedContent: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.lockedContent, configFileOptions?.include?.lockedContent)),
    postsWithMediaType: CLIOptionValidator.validateIncludeContentWithMediaType(pickDefined(commandLineOptions.include?.postsWithMediaType, configFileOptions?.include?.postsWithMediaType)),
    postsInTier: CLIOptionValidator.validateIncludeContentInTier(pickDefined(commandLineOptions.include?.postsInTier, configFileOptions?.include?.postsInTier)),
    postsPublished: {
      after: CLIOptionValidator.validateDateTime(pickDefined(commandLineOptions.include?.postsPublished?.after, configFileOptions?.include?.postsPublished?.after)) || null,
      before: CLIOptionValidator.validateDateTime(pickDefined(commandLineOptions.include?.postsPublished?.before, configFileOptions?.include?.postsPublished?.before)) || null,
    },
    campaignInfo: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.campaignInfo, configFileOptions?.include?.campaignInfo)),
    contentInfo: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.contentInfo, configFileOptions?.include?.contentInfo)),
    previewMedia: CLIOptionValidator.validateIncludePreviewMedia(pickDefined(commandLineOptions.include?.previewMedia, configFileOptions?.include?.previewMedia)),
    contentMedia: CLIOptionValidator.validateIncludeContentMedia(pickDefined(commandLineOptions.include?.contentMedia, configFileOptions?.include?.contentMedia)),
    allMediaVariants: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.allMediaVariants, configFileOptions?.include?.allMediaVariants)),
    mediaByFilename: {
      images: CLIOptionValidator.validateString(pickDefined(commandLineOptions.include?.mediaByFilename?.images, configFileOptions?.include?.mediaByFilename?.images)) || null,
      audio: CLIOptionValidator.validateString(pickDefined(commandLineOptions.include?.mediaByFilename?.audio, configFileOptions?.include?.mediaByFilename?.audio)) || null,
      attachments: CLIOptionValidator.validateString(pickDefined(commandLineOptions.include?.mediaByFilename?.attachments, configFileOptions?.include?.mediaByFilename?.attachments)) || null
    },
    comments: CLIOptionValidator.validateBoolean(pickDefined(commandLineOptions.include?.comments, configFileOptions?.include?.comments))
  };
}

function getEmbedDownloaderOptions(configFileOptions?: ConfigFileParseResult | null) {
  if (configFileOptions?.embedDownloaders) {
    return configFileOptions?.embedDownloaders.map((dl) => ({
      provider: CLIOptionValidator.validateRequired(dl.provider),
      exec: CLIOptionValidator.validateRequired(dl.exec)
    }));
  }
  return undefined;
}

function getProxyOptions(configFileOptions?: ConfigFileParseResult | null) {
  if (configFileOptions?.request?.proxy && configFileOptions.request.proxy.url?.value?.trim()) {
    return {
      url: CLIOptionValidator.validateProxyURL(configFileOptions.request.proxy.url),
      rejectUnauthorizedTLS: CLIOptionValidator.validateBoolean(configFileOptions.request.proxy.rejectUnauthorizedTLS)
    };
  }
  return null;
}

function readTargetsFile(file: string) {
  const includeKeys = {
    lockedContent: 'include.locked.content',
    postsWithMediaType: 'include.posts.with.media.type',
    postsInTier: 'include.posts.in.tier',
    postsPublishedAfter: 'include.posts.published.after',
    postsPublishedBefore: 'include.posts.published.before',
    campaignInfo: 'include.campaign.info',
    contentInfo: 'include.content.info',
    previewMedia: 'include.preview.media',
    contentMedia: 'include.content.media',
    allMediaVariants: 'include.all.media.variants',
    imagesByFilename: 'include.images.by.filename',
    audioByFilename: 'include.audio.by.filename',
    attachmentsByFilename: 'include.attachments.by.filename',
    comments: 'include.comments'
  };

  const lines = fs.readFileSync(file)
    .toString('utf-8')
    // Replace Windows line breaks with Unix ones and then split
    .replace(/\r\n/g, '\n').split('\n')
    .map((line) => line.trim());

  const currentTargets: { url: string; include?: RecursivePropsTo<DeepPartial<DownloaderIncludeOptions>, CLIOptionParserEntry>; }[] = [];
  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    try {
      const match = Object.entries(includeKeys).find((e) => line.startsWith(e[1]));
      if (match) {
        const [ optName, matchKey ] = match;
        const eq = line.indexOf('=');
        const propValue = (eq >= matchKey.length ? line.substring(eq + 1) : '').trim();
        if (propValue) {
          const target = currentTargets.at(-1);
          if (target) {
            const entry: CLIOptionParserEntry = {
              key: matchKey,
              line: ln,
              src: 'tgt',
              value: propValue
            };
            if (!target.include) {
              target.include = {};
            }
            if (matchKey === includeKeys.postsPublishedAfter || matchKey === includeKeys.postsPublishedBefore) {
              if (!target.include.postsPublished) {
                target.include.postsPublished = {};
              }
              if (matchKey === includeKeys.postsPublishedAfter) {
                target.include.postsPublished.after = entry;
              }
              else {
                target.include.postsPublished.before = entry;
              }
            }
            else if (matchKey === includeKeys.imagesByFilename || matchKey === includeKeys.audioByFilename ||
              matchKey === includeKeys.attachmentsByFilename) {
                if (!target.include.mediaByFilename) {
                  target.include.mediaByFilename = {};
                }
                switch (matchKey) {
                  case includeKeys.imagesByFilename:
                    target.include.mediaByFilename.images = entry;
                    break;
                  case includeKeys.audioByFilename:
                    target.include.mediaByFilename.audio = entry;
                    break;
                  case includeKeys.attachmentsByFilename:
                    target.include.mediaByFilename.attachments = entry;
                    break;
                }
              }
            else {
              target.include[optName as keyof DownloaderIncludeOptions] = entry;
            }
          }
        }
      }
      else {
        const url = CLIOptionValidator.validateTargetURL(line);
        currentTargets.push({ url });
      }
    }
    catch (error: any) {
      const errMsg = error instanceof Error ? error.message : error;
      throw Error(`Error parsing targets file (line ${ln})${errMsg ? `: ${errMsg}` : ''}`);
    }
  }

  const result: CLITargetURLEntry[] = [];
  for (const target of currentTargets) {
    const v: CLITargetURLEntry = { url: target.url };
    if (target.include) {
      const includeOpts = ObjectHelper.clean(getCLIIncludeOptions(target), {
        deep: true, cleanNulls: true, cleanEmptyObjects: true
      });
      if (Object.entries(includeOpts).length > 0) {
        v.include = includeOpts;
      }
    }
    result.push(v);
  }

  return result;
}
