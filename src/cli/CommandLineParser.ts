import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { type CLIOptionParserEntry, type CLIOptions } from './CLIOptions.js';
import { EOL } from 'os';
import { type DeepPartial, type RecursivePropsTo } from '../utils/Misc.js';
import { getPackageInfo } from '../utils/PackageInfo.js';

export interface CommandLineParseResult extends RecursivePropsTo<DeepPartial<Omit<CLIOptions, 'targetURLs'>>, CLIOptionParserEntry> {
  targetURLs?: CLIOptionParserEntry;
  configFile?: CLIOptionParserEntry;
}

const COMMAND_LINE_ARGS = {
  help: 'help',
  configureYouTube: 'configure-youtube',
  configFile: 'config-file',
  targetURL: 'target-url',
  cookie: 'cookie',
  ffmpeg: 'ffmpeg',
  outDir: 'out-dir',
  logLevel: 'log-level',
  noPrompt: 'no-prompt',
  dryRun: 'dry-run',
  listTiers: 'list-tiers',
  listTiersByUserId: 'list-tiers-uid'
} as const;

const OPT_DEFS = [
  {
    name: COMMAND_LINE_ARGS.help,
    description: 'Display this usage guide',
    alias: 'h',
    type: Boolean
  },
  {
    name: COMMAND_LINE_ARGS.configFile,
    description: 'Load configuration file for setting full options',
    alias: 'C',
    type: String,
    typeLabel: '<file>'
  },
  {
    name: COMMAND_LINE_ARGS.targetURL,
    description: 'URL of content to download',
    type: String,
    defaultOption: true
  },
  {
    name: COMMAND_LINE_ARGS.cookie,
    description: 'Cookie for accessing patron-only content',
    alias: 'c',
    type: String,
    typeLabel: '<string>'
  },
  {
    name: COMMAND_LINE_ARGS.ffmpeg,
    description: 'Path to FFmpeg executable',
    alias: 'f',
    type: String,
    typeLabel: '<string>'
  },
  {
    name: COMMAND_LINE_ARGS.outDir,
    description: 'Path to directory where content is saved',
    alias: 'o',
    type: String,
    typeLabel: '<dir>'
  },
  {
    name: COMMAND_LINE_ARGS.logLevel,
    description: 'Log level of the console logger: \'info\', \'debug\', \'warn\' or \'error\'; set to \'none\' to disable the logger.',
    alias: 'l',
    type: String,
    typeLabel: '<level>'
  },
  {
    name: COMMAND_LINE_ARGS.noPrompt,
    description: 'Do not prompt for confirmation to proceed',
    alias: 'y',
    type: Boolean
  },
  {
    name: COMMAND_LINE_ARGS.dryRun,
    description: 'Run without writing files to disk (except logs, if any). For testing / debugging.',
    type: Boolean
  },
  {
    name: COMMAND_LINE_ARGS.listTiers,
    description: 'List tiers for the given creator(s). Separate multiple creators with a comma.',
    type: String,
    typeLabel: '<creator>'
  },
  {
    name: COMMAND_LINE_ARGS.listTiersByUserId,
    description: 'Same as \'--list-tiers\', but takes user ID instead of vanity.',
    type: String,
    typeLabel: '<user ID>'
  },
  {
    name: COMMAND_LINE_ARGS.configureYouTube,
    description: 'Configure YouTube connection',
    type: Boolean
  }
];

export default class CommandLineParser {

  static parse(): CommandLineParseResult {
    const opts = this.#parseArgs();
    const argv = process.argv;

    const __getOptNameUsed = (key: string) => {
      const name = `--${key}`;
      if (argv.includes(name)) {
        return name;
      }
      const alias = OPT_DEFS.find((def) => def.name === key)?.alias;
      if (alias) {
        return `-${alias}`;
      }
      return name;
    };

    const __getValue = (key: typeof COMMAND_LINE_ARGS[keyof typeof COMMAND_LINE_ARGS]): CLIOptionParserEntry | undefined => {
      let value = opts[key];

      const booleanTypeArgs = [
        COMMAND_LINE_ARGS.noPrompt,
        COMMAND_LINE_ARGS.dryRun
      ];
      if (booleanTypeArgs.includes(key as any) && value !== undefined) {
        value = '1';
      }

      if (value === null) {
        throw Error(`Command-line option requires a value for '--${key}'`);
      }
      if (value && typeof value === 'string') {
        return {
          src: 'cli',
          key: __getOptNameUsed(key),
          value: value.trim()
        };
      }
      return undefined;
    };

    // Handle --log-level: none
    let consoleLoggerLevel = __getValue(COMMAND_LINE_ARGS.logLevel);
    let consoleLoggerEnabled: CLIOptionParserEntry | undefined;
    if (consoleLoggerLevel?.value === 'none') {
      consoleLoggerEnabled = {
        src: 'cli',
        key: '',
        value: '0'
      };
      consoleLoggerLevel = undefined;
    }

    return {
      configFile: __getValue(COMMAND_LINE_ARGS.configFile),
      targetURLs: __getValue(COMMAND_LINE_ARGS.targetURL),
      cookie: __getValue(COMMAND_LINE_ARGS.cookie),
      useStatusCache: undefined,
      pathToFFmpeg: __getValue(COMMAND_LINE_ARGS.ffmpeg),
      outDir: __getValue(COMMAND_LINE_ARGS.outDir),
      dirNameFormat: {
        campaign: undefined,
        content: undefined
      },
      filenameFormat: {
        media: undefined
      },
      include: {
        lockedContent: undefined,
        postsWithMediaType: undefined,
        campaignInfo: undefined,
        contentInfo: undefined,
        previewMedia: undefined,
        contentMedia: undefined,
        allMediaVariants: undefined
      },
      request: {
        maxRetries: undefined,
        maxConcurrent: undefined,
        minTime: undefined
      },
      fileExistsAction: {
        content: undefined,
        info: undefined,
        infoAPI: undefined
      },
      noPrompt: __getValue(COMMAND_LINE_ARGS.noPrompt),
      dryRun: __getValue(COMMAND_LINE_ARGS.dryRun),
      consoleLogger: {
        enabled: consoleLoggerEnabled,
        logLevel: consoleLoggerLevel,
        include: {
          dateTime: undefined,
          level: undefined,
          originator: undefined,
          errorStack: undefined
        },
        dateTimeFormat: undefined,
        color: undefined
      }
    };
  }

  static showUsage() {
    let opts;
    try {
      opts = this.#parseArgs();
    }
    catch (_error: unknown) {
      return false;
    }
    if (opts.help) {
      const content = [
        'Command-line options override corresponding options in configuration file loaded through \'-C\'.',
        EOL,
        'Project home: {underline https://github.com/patrickkfkan/patreon-dl}'
      ];
      const sections: commandLineUsage.Section[] = [
        {
          header: 'Usage',
          content: 'patreon-dl [OPTION]... URL'
        },
        {
          header: 'Options',
          optionList: OPT_DEFS,
          hide: 'target-url'
        },
        {
          content: content.join(EOL)
        }
      ];
      const banner = getPackageInfo().banner;
      if (banner) {
        sections.unshift({ header: banner, raw: true });
      }
      const usage = commandLineUsage(sections);
      console.log(usage);

      return true;
    }

    return false;
  }

  static configureYouTube() {
    let opts;
    try {
      opts = this.#parseArgs();
    }
    catch (_error: unknown) {
      return false;
    }
    return opts['configure-youtube'];
  }

  static listTiers() {
    let opts: commandLineArgs.CommandLineOptions;
    try {
      opts = this.#parseArgs();
    }
    catch (_error: unknown) {
      return null;
    }

    const __getTargets = (opt: '--list-tiers' | '--list-tiers-uid') => {
      const listTiers = opt === '--list-tiers' ? opts[COMMAND_LINE_ARGS.listTiers] : opts[COMMAND_LINE_ARGS.listTiersByUserId];
      if (listTiers === null) { // Option provided but has empty value
        return null;
      }
      else if (typeof listTiers === 'string') {
        const targets = listTiers.split(',').map((v) => v.trim()).filter((v) => v);
        if (targets.length === 0) {
          throw Error(`'${opt}' has invalid value`);
        }
        return targets;
      }
      return false;
    };

    const vanities = __getTargets('--list-tiers');
    const userIds = __getTargets('--list-tiers-uid');
    if (vanities === null || userIds === null) {
      const opt = vanities === null ? '--list-tiers' : '--list-tiers-uid';
      throw Error(`'${opt}' missing value`);
    }

    if (vanities === false && userIds === false) {
      return null;
    }

    return {
      byVanity: vanities || [],
      byUserId: userIds || []
    };
  }

  static #parseArgs() {
    const opts = commandLineArgs(OPT_DEFS, { stopAtFirstUnknown: true });
    if (opts['_unknown']) {
      const unknownOpt = Object.keys(opts['_unknown'])[0];
      throw Error(`Unknown command-line option '${unknownOpt}'`);
    }
    return opts;
  }
}
