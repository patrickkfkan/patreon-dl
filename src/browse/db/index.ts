import { type ISqlite, type Database } from 'sqlite';
import type Logger from '../../utils/logging/Logger.js';
import { commonLog, type LogLevel } from '../../utils/logging/Logger.js';
import { openDB } from './Init.js';
import { MediaDBMixin } from './MediaDBMixin.js';
import { UserDBMixin } from './UserDBMixin.js';
import { CampaignDBMixin } from './CampaignDBMixin.js';
import { ContentDBMixin } from './ContentDBMixin.js';
import { EnvDBMixin } from './EnvDBMixin.js';

export type DBConstructor = new (...args: any[]) => DBBase;

type DatabaseExecFn = Database['exec'];
type DatabaseRunFn = Database['run'];
type DatabaseGetFn = Database['get'];
type DatabaseAllFn = Database['all'];

export class DBBase {
  name = 'DB';

  private db: Database;
  protected logger?: Logger | null;

  constructor(db: Database, logger?: Logger | null) {
    this.db = db;
    this.logger = logger;
  }

  protected exec(...args: Parameters<DatabaseExecFn>) {
    const [ sql ] = args;
    this.log('debug', '(db.exec):', sql);
    return this.db.exec(...args);
  }

  protected run(...args: Parameters<DatabaseRunFn>) {
    const [ sql, params ] = args;
    this.log('debug', '(db.run):', this.#interpolateSqlParams(sql, params));
    return this.db.run(...args);
  }

  protected get<T = any>(...args: Parameters<DatabaseGetFn>) {
    const [ sql, params ] = args;
    this.log('debug', '(db.get):', this.#interpolateSqlParams(sql, params));
    return this.db.get<T>(...args);
  }

  protected all<T = any[]>(...args: Parameters<DatabaseAllFn>) {
    const [ sql, params ] = args;
    this.log('debug', '(db.all):', this.#interpolateSqlParams(sql, params));
    return this.db.all<T>(...args);
  }

  #interpolateSqlParams(sql: ISqlite.SqlType | string, params: any[]) {
    const _sql = typeof sql === 'string' ? sql : sql.sql;
    let i = 0;
    return _sql.replace(/\?/g, () => {
      const val = params[i++];
      const replaced = typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
      if (typeof replaced === 'string' && replaced.length > 100) {
        return `${replaced.substring(0, 99)}...'`;
      }
      return replaced;
    });
  }

  protected log(level: LogLevel, ...msg: any[]) {
    const limiterStopOnError = msg.find(
      (m) => m instanceof Error && m.message === 'LimiterStopOnError'
    );
    if (limiterStopOnError) {
      return;
    }
    commonLog(this.logger, level, this.name, ...msg);
  }
}

export class DBInstance extends EnvDBMixin(
  ContentDBMixin(
    CampaignDBMixin(
      UserDBMixin(
        MediaDBMixin(DBBase)
      )
    )
  )
) {}

export default class DB {
  protected static instance: DBInstance | null = null;

  static async getInstance(file: string, dryRun = false, logger?: Logger | null) {
    if (!this.instance) {
      const db = await openDB(file, dryRun, logger);
      this.instance = new DBInstance(db, logger);
    }
    return this.instance;
  }
}