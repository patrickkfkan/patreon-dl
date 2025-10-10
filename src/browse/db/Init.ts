import { type Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import type Logger from '../../utils/logging/Logger.js';
import { existsSync } from 'fs';
import { commonLog } from '../../utils/logging/Logger.js';

const DB_SCHEMA_VERSION = '1.0.0';

export async function openDB(file: string, dryRun = false, logger?: Logger | null) {
  const dbFileExists = dryRun ? false : existsSync(file);

  if (dryRun) {
    commonLog(
      logger,
      'info',
      'DB',
      `(dry-run) Creating in-memory database`
    );  
  }
  else {
    commonLog(
      logger,
      'info',
      'DB',
      `${dbFileExists ? 'Opening' : 'Creating'} database "${file}"`
    );
  }

  const db = await open({
    filename: dryRun ? ':memory:' : file,
    driver: sqlite3.cached.Database
  });

  try {
    await db.exec(`
      BEGIN TRANSACTION;

      CREATE TABLE IF NOT EXISTS "user" (
        "user_id" TEXT,
        "full_name" TEXT,
        "vanity" TEXT,
        "details" TEXT NOT NULL,
        PRIMARY KEY("user_id")
      );

      CREATE TABLE IF NOT EXISTS "campaign" (
        "campaign_id" TEXT,
        "creator_id" TEXT,
        "campaign_name" TEXT NOT NULL,
        "last_download" INTEGER NOT NULL,
        "details" TEXT NOT NULL,
        PRIMARY KEY("campaign_id")
        FOREIGN KEY("creator_id") REFERENCES "user"("user_id")
      );

      CREATE INDEX IF NOT EXISTS campaign_by_creator ON campaign(creator_id);

      CREATE TABLE IF NOT EXISTS "reward" (
        "reward_id" TEXT,
        "campaign_id" TEXT,
        "title" TEXT,
        "details" TEXT NOT NULL,
        PRIMARY KEY("reward_id","campaign_id")
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE INDEX IF NOT EXISTS reward_by_campaign ON reward(campaign_id);

      CREATE TABLE IF NOT EXISTS "content" (
        "content_id" TEXT,
        "content_type" TEXT,
        "campaign_id" TEXT,
        "title" TEXT,
        "content_subtype" TEXT,
        "is_viewable"  INTEGER,
        "published_at" INTEGER,
        "details" TEXT NOT NULL,
        PRIMARY KEY("content_id","content_type"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE INDEX IF NOT EXISTS content_by_campaign ON content(campaign_id);

      CREATE TABLE IF NOT EXISTS "post_tier" (
        "post_id" TEXT,
        "tier_id" TEXT,
        "campaign_id" TEXT,
        PRIMARY KEY("post_id","tier_id","campaign_id"),
        FOREIGN KEY("post_id") REFERENCES "content"("content_id"),
        FOREIGN KEY("tier_id", "campaign_id") REFERENCES "reward"("reward_id", "campaign_id"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE INDEX IF NOT EXISTS post_tier_by_post ON post_tier(post_id);
      CREATE INDEX IF NOT EXISTS post_tier_by_tier_and_campaign ON post_tier(tier_id, campaign_id);
      CREATE INDEX IF NOT EXISTS post_tier_by_campaign ON post_tire(campaign_id);

      CREATE TABLE IF NOT EXISTS "media" (
        "media_id" TEXT,
        "media_type" TEXT NOT NULL,
        "mime_type" TEXT,
        "thumbnail_mime_type" TEXT,
        "download_path" TEXT NOT NULL,
        "thumbnail_download_path" TEXT,
        "thumbnail_width" INTEGER,
        "thumbnail_height" INTEGER,
        PRIMARY KEY("media_id")
      );

      CREATE TABLE IF NOT EXISTS "content_media" (
        "media_id" TEXT,
        "content_id" TEXT,
        "content_type" TEXT,
        "media_index" INTEGER,
        "campaign_id" TEXT,
        "is_preview" INTEGER,
        PRIMARY KEY("media_id"),
        FOREIGN KEY("media_id") REFERENCES "media"("media_id"),
        FOREIGN KEY("content_id","content_type") REFERENCES "content"("content_id","content_type"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE INDEX IF NOT EXISTS content_media_by_media ON content_media(media_id);
      CREATE INDEX IF NOT EXISTS content_media_by_content_and_type ON content_media(content_id, content_type);
      CREATE INDEX IF NOT EXISTS content_media_by_campaign ON content_media(campaign_id);

      CREATE TABLE IF NOT EXISTS "post_comments" (
        "post_id" TEXT,
        "comment_count" TEXT NOT NULL,
        "comments" TEXT,
        PRIMARY KEY("post_id"),
        FOREIGN KEY("post_id") REFERENCES "content"("content_id")
      );

      CREATE INDEX IF NOT EXISTS post_comments_by_post ON post_comments(post_id);

      CREATE TABLE IF NOT EXISTS "env" (
        "env_key" TEXT,
        "value" TEXT,
        PRIMARY KEY("env_key")
      );

      COMMIT;
    `);
  }
  catch (error: any) {
    let rollbackError: any = null;
    try {
      await db.exec('ROLLBACK');
    } catch (_rollbackError) {
      rollbackError = _rollbackError;
    }

    throw new Error(`Failed to initialize DB${ rollbackError ? ' (rollback failed)' : '' }:`, { cause: error });
  }

  if (!dbFileExists) {
    await db.run(`INSERT INTO env (env_key, value) VALUES (?, ?)`, [
      'db_schema_version',
      DB_SCHEMA_VERSION
    ]);
  } else {
    await checkDBSchemaVersion(db, logger);
  }

  return db;
}

async function checkDBSchemaVersion(db: Database, logger?: Logger | null) {
  const result = await db.get(`SELECT value FROM env WHERE env_key = ?`, [
    'db_schema_version'
  ]);
  const version = result?.value || '';
  if (version) {
    commonLog(logger, 'debug', 'DB', `DB schema version: ${version}`);
  } else {
    commonLog(
      logger,
      'warn',
      'DB',
      'Failed to obtain DB schema version. Database could be corrupted!'
    );
    return;
  }

  // Code to be added here if schema needs to be updatd
}
