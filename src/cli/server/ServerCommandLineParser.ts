import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { EOL } from 'os';
import { getPackageInfo } from '../../utils/PackageInfo.js';
import { DEFAULT_WEB_SERVER_PORT } from '../../browse/server/WebServer.js';
import { type ServerCLIOptionParserEntry, type ServerCLIOptions } from './ServerCLIOptions.js';
import { type DeepPartial, type RecursivePropsTo } from '../../utils/Misc.js';

export interface ServerCommandLineParseResult extends RecursivePropsTo<DeepPartial<Omit<ServerCLIOptions, 'consoleLogger' | 'fileLogger'>>, ServerCLIOptionParserEntry> {
  logLevel?: ServerCLIOptionParserEntry;
  logFile?: ServerCLIOptionParserEntry;
};

const COMMAND_LINE_ARGS = {
  help: 'help',
  dataDir: 'data-dir',
  port: 'port',
  logLevel: 'log-level',
  logFile: 'log-file'
} as const;

const OPT_DEFS = [
  {
    name: COMMAND_LINE_ARGS.help,
    description: 'Display this usage guide',
    alias: 'h',
    type: Boolean
  },
  {
    name: COMMAND_LINE_ARGS.dataDir,
    description: 'Directory containing downloaded content. Default: current working directory',
    alias: 'i',
    type: String,
    typeLabel: '<dir>'
  },
  {
    name: COMMAND_LINE_ARGS.port,
    description: `Web server port. Default: ${DEFAULT_WEB_SERVER_PORT}, or a random port if ${DEFAULT_WEB_SERVER_PORT} is already in use.`,
    alias: 'p',
    type: Number
  },
  {
    name: COMMAND_LINE_ARGS.logLevel,
    description: 'Log level of the console logger: \'info\', \'debug\', \'warn\' or \'error\'; set to \'none\' to disable the logger. Default: info',
    alias: 'l',
    type: String,
    typeLabel: '<level>'
  },
  {
    name: COMMAND_LINE_ARGS.logFile,
    description: 'Save logs to <file>',
    alias: 'f',
    type: String,
    typeLabel: '<file>'
  }
];

export default class ServerCommandLineParser {

  static parse(): ServerCommandLineParseResult {
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

    const __getValue = (key: typeof COMMAND_LINE_ARGS[keyof typeof COMMAND_LINE_ARGS]): ServerCLIOptionParserEntry | undefined => {
      const value = opts[key];

      if (value === null) {
        throw Error(`Command-line option requires a value for '--${key}'`);
      }
      if ((typeof value === 'string' && value) || typeof value === 'number') {
        return {
          src: 'cli',
          key: __getOptNameUsed(key),
          value: String(value).trim()
        };
      }
      return undefined;
    };

    return {
      dataDir: __getValue(COMMAND_LINE_ARGS.dataDir),
      port: __getValue(COMMAND_LINE_ARGS.port),
      logLevel: __getValue(COMMAND_LINE_ARGS.logLevel),
      logFile: __getValue(COMMAND_LINE_ARGS.logFile)
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
        'Project home: {underline https://github.com/patrickkfkan/patreon-dl}'
      ];
      const sections: commandLineUsage.Section[] = [
        {
          content: 'Starts a web server for browsing downloaded content.'
        },
        {
          header: 'Usage',
          content: 'patreon-dl-server [OPTION]...'
        },
        {
          header: 'Options',
          optionList: OPT_DEFS
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

  static #parseArgs() {
    const opts = commandLineArgs(OPT_DEFS, { stopAtFirstUnknown: true });
    if (opts['_unknown']) {
      const unknownOpt = Object.keys(opts['_unknown'])[0];
      throw Error(`Unknown command-line option '${unknownOpt}'`);
    }
    return opts;
  }
}
