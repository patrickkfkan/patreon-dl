import { type Database } from "better-sqlite3";
import type Logger from '../../../utils/logging/Logger.js';
import { type DBUpdater } from "../Update.js";

const TARGET_VERSION = '1.1.0';

function update(_db: Database, _currentVersion: string, _logger?: Logger | null) {
  // Only indexes added in v1.1.0, which should have been created in Init, so
  // nothing to do here.
  return Promise.resolve();
}

export const DBUpdater_1_1_0: DBUpdater = {
  targetVersion: TARGET_VERSION,
  update
};