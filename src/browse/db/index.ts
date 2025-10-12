import type Database from 'better-sqlite3';
import type Logger from '../../utils/logging/Logger.js';
import { commonLog, type LogLevel } from '../../utils/logging/Logger.js';
import { openDB } from './Init.js';
import { MediaDBMixin } from './MediaDBMixin.js';
import { UserDBMixin } from './UserDBMixin.js';
import { CampaignDBMixin } from './CampaignDBMixin.js';
import { ContentDBMixin } from './ContentDBMixin.js';
import { EnvDBMixin } from './EnvDBMixin.js';
import path from 'path';

export type DBConstructor = new (...args: any[]) => DBBase;
export type DBInstance = InstanceType<typeof DB>;

interface DBPool {
  [dbPath: string]: { db: Database.Database; count: number; } | undefined;
}

export class DBBase {
  name = 'DB';

  dbPath: string | null;
  static dbPool: DBPool = {};
  db: Database.Database;
  logger?: Logger | null;

  constructor(dbPath: string | null, db: Database.Database, logger?: Logger | null) {
    this.dbPath = dbPath;
    this.db = db;
    this.logger = logger;
  }

  static async getInstance(file: string, dryRun = false, logger?: Logger | null): Promise<DBInstance> {
    let db: Database.Database;
    let dbPath: string | null;
    if (dryRun) {
      dbPath = null;
      db = await openDB(file, dryRun, logger);
    }
    else {
      dbPath = path.resolve(file);
      const poolEntry = this.dbPool[dbPath];
      if (poolEntry) {
        db = poolEntry.db;
        poolEntry.count++;
        commonLog(
          logger,
          'debug',
          'DB',
          `Obtained DB from pool (shares: ${poolEntry.count})`
        );
      }
      else {
        db = await openDB(file, dryRun, logger);
        this.dbPool[dbPath] = {
          db,
          count: 1
        };
        commonLog(
          logger,
          'debug',
          'DB',
          `Added DB to pool`
        );
      }
    }
    return new DB(dbPath, db, logger);
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
    if (!this.dbPath) {
      this.log('debug', '(dry-run) Close in-memory DB');
      this.db.close();
      return;
    }
    const poolEntry = DBBase.dbPool[this.dbPath];
    if (poolEntry && poolEntry.count > 0) {
      poolEntry.count--;
      if (poolEntry.count === 0) {
        this.log('debug', 'Close DB (no shares remaining)');
        delete DBBase.dbPool[this.dbPath];
        this.db.close();
      }
      else {
        this.log('debug', `Close DB skipped - ${poolEntry.count} shares remaining`)
      }
    }
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