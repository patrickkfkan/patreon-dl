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

export enum FileLoggerType {
  Downloader = 'downloader',
  Server = 'server'
};

export type FileLoggerOptions<T extends FileLoggerType> =
  ConsoleLoggerOptions & 
  ( T extends FileLoggerType.Downloader ? {
      init: DownloaderFileLoggerInit;
      logDir?: string;
      logFilename?: string;
      fileExistsAction?: 'append' | 'overwrite';
    }
    : T extends FileLoggerType.Server ? {
      logFilePath: string;
      fileExistsAction?: 'append' | 'overwrite';
    }
    : never
  );

export type FileLoggerConfig<T extends FileLoggerType> =
  DeepRequired<FileLoggerOptions<T>> & {
    logDir: string;
    logFilename: string;
    logFilePath: string;
    created: Date;
  };

export type FileLoggerGetPathInfoParams<T extends FileLoggerType> =
  T extends FileLoggerType.Downloader ? Pick<FileLoggerOptions<T>, 'init' | 'logDir' | 'logFilename' | 'logLevel'>
  : T extends FileLoggerType.Server ? Pick<FileLoggerOptions<T>, 'logFilePath'>
  : never;

const DEFAULT_DOWNLOADER_LOGGER_CONFIG: Omit<FileLoggerConfig<FileLoggerType.Downloader>, 'init' | 'created'> = {
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

const DEFAULT_SERVER_LOGGER_FILE_EXISTS_ACTION = 'append';

export interface DownloaderFileLoggerInit {
  targetURL: string;
  outDir?: string;
  date?: Date;
}

export default class FileLogger<T extends FileLoggerType = FileLoggerType.Downloader> extends ConsoleLogger {

  protected config: FileLoggerConfig<T>;
  #fileExistsAction: FileLoggerConfig<T>['fileExistsAction'];
  #stream: fs.WriteStream | null;
  #firstRun: boolean;

  constructor(options: FileLoggerOptions<T>) {
    super(options);
    
    const defaultFileExistsAction = this.#isDownloaderOptions(options) ?
      DEFAULT_DOWNLOADER_LOGGER_CONFIG.fileExistsAction
      : DEFAULT_SERVER_LOGGER_FILE_EXISTS_ACTION;
    this.#fileExistsAction = options?.fileExistsAction || defaultFileExistsAction;
    this.#stream = null;
    this.#firstRun = true;
    this.config.color = pickDefined(options?.color, DEFAULT_DOWNLOADER_LOGGER_CONFIG.color);

    const pathInfo = this.#isDownloaderOptions(options) ?
      FileLogger.#getPathInfoForDownloaderType(options)
      : FileLogger.#getPathInfoForServerType(options);

    this.config.logDir = pathInfo.logDir;
    this.config.logFilename = pathInfo.filename;
    this.config.logFilePath = pathInfo.filePath;
    this.config.created = pathInfo.created;
  }

  static getPathInfo<T extends FileLoggerType>(
    type: T,
    params: FileLoggerGetPathInfoParams<T>
  ) {
    switch (type) {
      case FileLoggerType.Downloader:
        return this.#getPathInfoForDownloaderType(params as FileLoggerGetPathInfoParams<FileLoggerType.Downloader>);
      case FileLoggerType.Server:
        return this.#getPathInfoForServerType(params as FileLoggerGetPathInfoParams<FileLoggerType.Server>);
    }
    return undefined as never;
  }

  static #getPathInfoForDownloaderType(params: FileLoggerGetPathInfoParams<FileLoggerType.Downloader>) {
    const defaultLogDir = DEFAULT_DOWNLOADER_LOGGER_CONFIG.logDir.replaceAll('/', path.sep);
    const {
      date = new Date(),
      outDir = getDefaultDownloaderOutDir(),
      targetURL
    } = params.init;
    const {
      logDir: dirNameFormat = defaultLogDir,
      logFilename: filenameFormat = DEFAULT_DOWNLOADER_LOGGER_CONFIG.logFilename,
      logLevel = DEFAULT_DOWNLOADER_LOGGER_CONFIG.logLevel } = params;

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

    const logDir = path.resolve(
      process.cwd(),
      FSHelper.sanitizeFilePath(Formatter.format(dirNameFormat, logDirDict).result)
    );
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

  static #getPathInfoForServerType(params: FileLoggerGetPathInfoParams<FileLoggerType.Server>) {
    const filePath = path.resolve(
      process.cwd(),
      FSHelper.sanitizeFilePath(params.logFilePath)
    );
    const { dir: logDir, base: filename } = path.parse(filePath);
    return {
      logDir,
      filename,
      filePath,
      created: new Date()
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

  #isDownloaderOptions(options: FileLoggerOptions<FileLoggerType>): options is FileLoggerOptions<FileLoggerType.Downloader> {
    return Reflect.has(options, 'init');
  }

  getConfig() {
    return this.config;
  }

  static getDefaultConfig() {
    const config = {
      ...DEFAULT_DOWNLOADER_LOGGER_CONFIG
    };
    config.logDir = config.logDir.replaceAll('/', path.sep);
    return config;
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
