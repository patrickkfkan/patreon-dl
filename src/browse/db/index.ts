import type Database from 'better-sqlite3';
import type Logger from '../../utils/logging/Logger.js';
import { commonLog, type LogLevel } from '../../utils/logging/Logger.js';
import { openDB } from './Init.js';
import { MediaDBMixin } from './MediaDBMixin.js';
import { UserDBMixin } from './UserDBMixin.js';
import { CampaignDBMixin } from './CampaignDBMixin.js';
import { ContentDBMixin } from './ContentDBMixin.js';
import { EnvDBMixin } from './EnvDBMixin.js';

export type DBConstructor = new (...args: any[]) => DBBase;
export type DBInstance = InstanceType<typeof DB>;

export class DBBase {
  name = 'DB';

  static instance: DBInstance | null = null;
  db: Database.Database;
  logger?: Logger | null;

  constructor(db: Database.Database, logger?: Logger | null) {
    this.db = db;
    this.logger = logger;
  }

  static async getInstance(file: string, dryRun = false, logger?: Logger | null) {
    if (!this.instance) {
      const db = await openDB(file, dryRun, logger);
      this.instance = new DB(db, logger);
    }
    return this.instance;
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  run(sql: string, params?: any[]): Database.RunResult {
    const stmt = this.db.prepare(sql);
    return params ? stmt.run(...params) : stmt.run();
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  get<T = any>(sql: string, params?: any[]): T | undefined {
    const stmt = this.db.prepare(sql);
    return (params ? stmt.get(...params) : stmt.get()) as T | undefined;
  }

  all<T = any>(sql: string, params?: any[]): T[] {
    const stmt = this.db.prepare(sql);
    return (params ? stmt.all(...params) : stmt.all()) as T[];
  }

  close(): void {
    this.db.close();
  }

  transaction(fn: (...args: any[]) => any): (...args: any[]) => any {
    return this.db.transaction(fn);
  }

  log(level: LogLevel, ...msg: any[]) {
    const limiterStopOnError = msg.find(
      (m) => m instanceof Error && m.message === 'LimiterStopOnError'
    );
    if (limiterStopOnError) {
      return;
    }
    commonLog(this.logger, level, this.name, ...msg);
  }
}

const DB = EnvDBMixin(
  ContentDBMixin(
    CampaignDBMixin(
      UserDBMixin(
        MediaDBMixin(DBBase)
      )
    )
  )
);

export default DB;