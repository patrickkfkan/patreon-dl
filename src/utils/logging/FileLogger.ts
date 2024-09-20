import fs from 'fs';
import dateFormat from 'dateformat';
import { type LogLevel } from '../../utils/logging/Logger.js';
import { type DeepRequired, pickDefined } from '../Misc.js';
import ConsoleLogger, { type ConsoleLoggerOptions } from './ConsoleLogger.js';
import Formatter from '../Formatter.js';
import path from 'path';
import FSHelper from '../FSHelper.js';
import { EOL } from 'os';
import { getDefaultDownloaderOutDir } from '../../downloaders/DownloaderOptions.js';

export interface FileLoggerOptions extends ConsoleLoggerOptions {
  logDir?: string;
  logFilename?: string;
  fileExistsAction?: 'append' | 'overwrite';
}

export interface FileLoggerConfig extends DeepRequired<FileLoggerOptions> {
  logFilePath: string;
  created: Date;
}

const DEFAULT_LOGGER_CONFIG: Omit<FileLoggerConfig, 'created'> = {
  enabled: true,
  logDir: '{out.dir}/logs/{target.url.path}',
  logFilename: '{datetime.yyyymmdd}-{log.level}.log',
  fileExistsAction: 'append',
  logFilePath: '',
  logLevel: 'info',
  include: {
    dateTime: true,
    level: true,
    originator: true,
    errorStack: false
  },
  dateTimeFormat: 'mmm dd HH:MM:ss',
  color: false
};

export interface FileLoggerInit {
  targetURL: string;
  outDir?: string;
  date?: Date;
}

export default class FileLogger extends ConsoleLogger {

  protected config: FileLoggerConfig;
  #fileExistsAction: FileLoggerConfig['fileExistsAction'];
  #stream: fs.WriteStream | null;
  #firstRun: boolean;

  constructor(init: FileLoggerInit, options?: FileLoggerOptions) {
    super(options);
    this.#fileExistsAction = options?.fileExistsAction || DEFAULT_LOGGER_CONFIG.fileExistsAction;
    this.#stream = null;
    this.#firstRun = true;
    this.config.color = pickDefined(options?.color, DEFAULT_LOGGER_CONFIG.color);

    const pathInfo = FileLogger.getPathInfo({
      ...init,
      ...options
    });

    this.config.logDir = pathInfo.logDir;
    this.config.logFilename = pathInfo.filename;
    this.config.logFilePath = pathInfo.filePath;
    this.config.created = pathInfo.created;
  }

  static getPathInfo(data: FileLoggerInit & Pick<FileLoggerOptions, 'logDir' | 'logFilename' | 'logLevel'>) {
    const defaultLogDir = DEFAULT_LOGGER_CONFIG.logDir.replaceAll('/', path.sep);
    const {
      date = new Date(),
      outDir = getDefaultDownloaderOutDir(),
      targetURL,
      logDir: dirNameFormat = defaultLogDir,
      logFilename: filenameFormat = DEFAULT_LOGGER_CONFIG.logFilename,
      logLevel = DEFAULT_LOGGER_CONFIG.logLevel } = data;

    const __getDateTimeFieldValues = (format: string, addTo: Record<string, string>) => {
      const dateTimeRegex = /{(datetime\.(.+?))}/g;
      const dateTimeFields: { name: string; pattern: string; }[] = [];
      let m;
      while ((m = dateTimeRegex.exec(format)) !== null) {
        dateTimeFields.push({
          name: m[1],
          pattern: m[2]
        });
      }
      return dateTimeFields.reduce<Record<string, string>>((result, field) => {
        if (!result[field.name]) {
          result[field.name] = dateFormat(date, field.pattern);
        }
        return result;
      }, addTo);
    };

    // Prepare variables for generating log dir and filenames
    let urlPath = new URL(targetURL).pathname.trim();
    while (urlPath.startsWith('/')) {
      urlPath = urlPath.slice(1);
    }
    while (urlPath.endsWith('/')) {
      urlPath = urlPath.slice(0, urlPath.length - 1);
    }
    urlPath = FSHelper.sanitizeFilename(urlPath.replaceAll('/', '_'));

    const logDirDTValues = __getDateTimeFieldValues(dirNameFormat, {});
    const allDTValues = __getDateTimeFieldValues(filenameFormat, logDirDTValues);

    // Pass to Formatter and get log dir and filename
    const logDirDict = {
      'out.dir': outDir,
      'target.url.path': urlPath,
      ...allDTValues
    };

    const logFilenameDict = {
      'target.url.path': urlPath,
      'log.level': logLevel,
      ...allDTValues
    };

    const logDir = FSHelper.sanitizeFilePath(Formatter.format(dirNameFormat, logDirDict).result);
    const filename = FSHelper.sanitizeFilename(Formatter.format(filenameFormat, logFilenameDict).result);
    const filePath = path.resolve(logDir, filename);
    const created = date;

    return {
      logDir,
      filename,
      filePath,
      created
    };
  }

  #getStream() {
    if (this.#stream) {
      return this.#stream;
    }
    // Ensure log directory exists
    FSHelper.createDir(this.config.logDir);

    // Create write stream
    let flags: 'a' | 'w';
    if (fs.existsSync(this.config.logFilePath) && (!this.#firstRun || this.#fileExistsAction === 'append')) {
      flags = 'a';
    }
    else {
      flags = 'w';
    }
    this.#stream = fs.createWriteStream(this.config.logFilePath, { flags, encoding: 'utf-8', autoClose: false });
    if (this.#firstRun) {
      const initDateTimeStr = dateFormat(this.config.created, 'mmm dd yyyy HH:MM:ss').toUpperCase();
      this.#stream.write(`${EOL}*************** LOG BEGIN ${initDateTimeStr} ***************${EOL}`);
      this.#firstRun = false;
    }
    return this.#stream;
  }

  getConfig() {
    return this.config;
  }

  protected toOutput(_level: LogLevel, msg: string[]) {
    const stream = this.#getStream();
    stream.write(msg.join(' '));
    stream.write(EOL);
  }

  end(): Promise<void> {
    return new Promise((resolve) => {
      if (this.#stream) {
        this.#stream.once('finish', () => {
          this.#stream = null;
          resolve();
        });
        this.#stream.end();
      }
      else {
        resolve();
      }
    });
  }
}
