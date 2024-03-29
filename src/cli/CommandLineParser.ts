import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { CLIOptionParserEntry, CLIOptions } from './CLIOptions.js';
import { EOL } from 'os';
import { DeepPartial, RecursivePropsTo } from '../utils/Misc.js';
import { getPackageInfo } from '../utils/PackageInfo.js';

export interface CommandLineParseResult extends RecursivePropsTo<DeepPartial<CLIOptions>, CLIOptionParserEntry> {
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
  noPrompt: 'no-prompt'
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
      if (key === COMMAND_LINE_ARGS.noPrompt && value !== undefined) {
        value = '1';
      }
      else if (value === null) {
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
      targetURL: __getValue(COMMAND_LINE_ARGS.targetURL),
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
    catch (error) {
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
    catch (error) {
      return false;
    }
    return opts['configure-youtube'];
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
