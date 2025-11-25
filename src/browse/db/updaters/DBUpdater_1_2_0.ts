import { type Database } from "better-sqlite3";
import type Logger from '../../../utils/logging/Logger.js';
import { type DBUpdater } from "../Update.js";
import { buildPostFTS } from "../PostFTS.js";
import { buildProductFTS } from "../ProductFTS.js";

const TARGET_VERSION = '1.2.0';

function update(_db: Database, _currentVersion: string, _logger?: Logger | null) {
  buildPostFTS(_db, _logger);
  buildProductFTS(_db, _logger);
  return Promise.resolve();
}

export const DBUpdater_1_2_0: DBUpdater = {
  targetVersion: TARGET_VERSION,
  update
};