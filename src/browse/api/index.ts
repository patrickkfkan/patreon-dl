import type Logger from '../../utils/logging/Logger.js';
import { commonLog, type LogLevel } from '../../utils/logging/Logger.js';
import { CampaignAPIMixin } from './CampaignAPIMixin.js';
import { type DBInstance } from '../db';
import { ContentAPIMixin } from './ContentAPIMixin.js';
import { SettingsAPIMixin } from './SettingsAPIMixin.js';
import { MediaAPIMixin } from './MediaAPIMixin.js';
import { FilterAPIMixin } from './FilterAPIMixin.js';

export type APIConstructor = new (...args: any[]) => APIBase;
export type APIInstance = InstanceType<typeof API>;

export class APIBase {
  name = 'API';

  protected static instance: APIInstance | null = null;
  protected db: DBInstance;
  protected logger?: Logger | null;

  constructor(db: DBInstance, logger?: Logger | null) {
    this.db = db;
    this.logger = logger;
  }

  static getInstance(db: DBInstance, logger?: Logger | null) {
    if (!this.instance) {
      this.instance = new API(db, logger);
    }
    return this.instance;
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

const API = FilterAPIMixin(MediaAPIMixin(SettingsAPIMixin(ContentAPIMixin(CampaignAPIMixin(APIBase)))));

export default API;
