import type Database from 'better-sqlite3';
import semver from 'semver';
import path from 'path';
import dateFormat from 'dateformat';
import type Logger from '../../utils/logging/Logger.js';
import { DBUpdater_1_1_0 } from './updaters/DBUpdater_1_1_0.js';
import { DBUpdater_1_2_0 } from './updaters/DBUpdater_1_2_0.js';
import { commonLog } from '../../utils/logging/Logger.js';

export interface DBUpdater {
  targetVersion: string;
  update: (db: Database.Database, currentVersion: string, logger?: Logger | null) => Promise<void>;
}

const updaters: DBUpdater[] = [
  DBUpdater_1_1_0,
  DBUpdater_1_2_0
];

function getUpdaterByClosestHigherVersion(currentVersion: string) {
  const higher = updaters.filter(up => semver.gt(up.targetVersion, currentVersion));
  if (higher.length === 0) return null;
  return higher.sort((a, b) => semver.compare(a.targetVersion, b.targetVersion))[0];
}


export async function updateDB(db: Database.Database, currentVersion: string, logger?: Logger | null, firstRun = true) {
  const updater = getUpdaterByClosestHigherVersion(currentVersion);
  
  if (!updater) {
    return;
  }
  if (firstRun) {
    const dbFile = db.name;
    const bakFile = path.resolve(path.dirname(dbFile), `db-backup-v${currentVersion}-${dateFormat(new Date(), 'yyyymmdd-HH_MM_ss')}.sqlite`);
    commonLog(
      logger,
      'info',
      'DB',
      `DB needs updating. Current DB will be backed up to "${bakFile}"`
    );
    commonLog(
      logger,
      'info',
      'DB',
      'Backing up DB...'
    )
    await db.backup(bakFile);
  }
  commonLog(
    logger,
    'info',
    'DB',
    `Update v${currentVersion} -> v${updater.targetVersion}`
  );
  try {
    db.exec('BEGIN TRANSACTION;');
    await updater.update(db, currentVersion, logger);
    db.prepare(`UPDATE env SET value = ? WHERE env_key = ?`).run(
      updater.targetVersion,
      'db_schema_version'
    );
    db.exec('COMMIT;');
  }
  catch (error: any) {
    let rollbackError: any = null;
    try {
      db.exec('ROLLBACK;');
    } catch (_rollbackError) {
      rollbackError = _rollbackError;
    }

    throw Error(`Failed to update DB from v${currentVersion} -> v${updater.targetVersion}${ rollbackError ? ' (rollback failed)' : '' }:`, { cause: error });
  }

  return updateDB(db, updater.targetVersion, logger, false);
}