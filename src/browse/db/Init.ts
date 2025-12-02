import Database from 'better-sqlite3';
import type Logger from '../../utils/logging/Logger.js';
import { existsSync } from 'fs';
import { commonLog } from '../../utils/logging/Logger.js';
import { updateDB } from './Update.js';
import semver from 'semver';
import { initDBPostFTS } from './PostFTS.js';
import { initDBCollectionFTS } from './CollectionFTS.js';
import { initDBProductFTS } from './ProductFTS.js';

const DB_SCHEMA_VERSION = '1.2.0';

export async function openDB(file: string, dryRun = false, logger?: Logger | null): Promise<Database.Database> {
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

  const db = new Database(
    dryRun ? ':memory:' : file,
    {
      verbose: logger ? (msg) => commonLog(logger, 'debug', 'DB', msg) : undefined
    }
  );

  try {
    db.exec('PRAGMA foreign_keys = OFF;');
    db.exec(`BEGIN TRANSACTION;`);
    db.exec(`
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

      CREATE INDEX IF NOT EXISTS campaign_by_last_download ON campaign(last_download);
      CREATE INDEX IF NOT EXISTS campaign_by_name ON campaign(campaign_name);

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

      CREATE INDEX IF NOT EXISTS viewable_posts_by_campaign_and_published_and_subtype ON content(
        campaign_id,
        published_at,
        content_subtype
      ) WHERE content_type = 'post' AND is_viewable = 1;

      CREATE INDEX IF NOT EXISTS posts_by_campaign_and_published_and_subtype ON content(
        campaign_id,
        published_at,
        content_subtype
      ) WHERE content_type = 'post';

      CREATE INDEX IF NOT EXISTS viewable_posts_by_campaign_and_subtype_and_title ON content(
        campaign_id,
        content_subtype,
        title
      ) WHERE content_type = 'post' AND is_viewable = 1;

      CREATE INDEX IF NOT EXISTS posts_by_campaign_and_subtype_and_title ON content(
        campaign_id,
        content_subtype,
        title
      ) WHERE content_type = 'post';

      CREATE INDEX IF NOT EXISTS viewable_products_by_campaign_and_published ON content(
        campaign_id,
        published_at
      ) WHERE content_type = 'product' AND is_viewable = 1;

      CREATE INDEX IF NOT EXISTS products_by_campaign_and_published ON content(
        campaign_id,
        published_at
      ) WHERE content_type = 'product';

      CREATE INDEX IF NOT EXISTS content_by_campaign_and_type_and_published ON content(content_id, campaign_id, content_type, published_at);

      CREATE TABLE IF NOT EXISTS "post_tier" (
        "post_id" TEXT,
        "tier_id" TEXT,
        "campaign_id" TEXT,
        PRIMARY KEY("post_id","tier_id","campaign_id"),
        FOREIGN KEY("post_id") REFERENCES "content"("content_id"),
        FOREIGN KEY("tier_id", "campaign_id") REFERENCES "reward"("reward_id", "campaign_id"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE INDEX IF NOT EXISTS post_tier_by_campaign_and_tier ON post_tier(campaign_id, tier_id);

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

      CREATE INDEX IF NOT EXISTS content_media_by_content_and_type ON content_media(content_id, content_type);
      CREATE INDEX IF NOT EXISTS content_media_by_campaign_and_index ON content_media(campaign_id, media_index);

      CREATE TABLE IF NOT EXISTS "post_comments" (
        "post_id" TEXT,
        "comment_count" TEXT NOT NULL,
        "comments" TEXT,
        PRIMARY KEY("post_id"),
        FOREIGN KEY("post_id") REFERENCES "content"("content_id")
      );

      -- Added v1.2.0 --

      CREATE TABLE IF NOT EXISTS "collection" (
        "collection_id" TEXT,
        "campaign_id" TEXT,
        "title" TEXT,
        "created_at" INTEGER,
        "edited_at" INTEGER,
        "details" TEXT NOT NULL,
        PRIMARY KEY("collection_id"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE INDEX IF NOT EXISTS collection_by_campaign_and_created ON collection(campaign_id, created_at);

      CREATE INDEX IF NOT EXISTS collection_by_campaign_and_title ON collection(campaign_id, title);

      CREATE INDEX IF NOT EXISTS collection_by_campaign_and_edited ON collection(campaign_id, edited_at);

      CREATE TABLE IF NOT EXISTS "post_collection" (
        "collection_id" TEXT,
        "campaign_id" TEXT,
        "post_id" TEXT,
        "post_created_at" INTEGER,
        PRIMARY KEY("collection_id", "campaign_id", "post_id"),
        FOREIGN KEY("post_id") REFERENCES "content"("content_id"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id"),
        FOREIGN KEY("collection_id", "campaign_id") REFERENCES "collection"("collection_id", "campaign_id")
      );

      CREATE INDEX IF NOT EXISTS post_collection_by_created ON post_collection(collection_id, campaign_id, post_created_at);

      CREATE TABLE IF NOT EXISTS "post_tag" (
        "post_tag_id" TEXT,
        "campaign_id" TEXT,
        "value" TEXT,
        "details" TEXT NOT NULL,
        PRIMARY KEY("post_tag_id", "campaign_id"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id")
      );

      CREATE TABLE IF NOT EXISTS "post_tag_post" (
        "post_tag_id" TEXT,
        "campaign_id" TEXT,
        "post_id" TEXT,
        PRIMARY KEY("post_tag_id", "campaign_id", "post_id"),
        FOREIGN KEY("post_id") REFERENCES "content"("content_id"),
        FOREIGN KEY("campaign_id") REFERENCES "campaign"("campaign_id"),
        FOREIGN KEY("post_tag_id", "campaign_id") REFERENCES "post_tag"("post_tag_id", "campaign_id")
      );

      ------------------

      CREATE TABLE IF NOT EXISTS "env" (
        "env_key" TEXT,
        "value" TEXT,
        PRIMARY KEY("env_key")
      );
    `);

    // FTS added v1.2.0
    initDBPostFTS(db);
    initDBProductFTS(db);
    initDBCollectionFTS(db);

    db.exec(`COMMIT;`);
  }
  catch (error: any) {
    let rollbackError: any = null;
    try {
      db.exec('ROLLBACK');
    } catch (_rollbackError) {
      rollbackError = _rollbackError;
    }

    throw new Error(`Failed to initialize DB${ rollbackError ? ' (rollback failed)' : '' }:`, { cause: error });
  }

  if (!dbFileExists) {
    db.prepare(`INSERT INTO env (env_key, value) VALUES (?, ?)`).run(
      'db_schema_version',
      DB_SCHEMA_VERSION
    );
  } else {
    await checkDBSchemaVersion(db, logger);
  }

  return db;
}

async function checkDBSchemaVersion(db: Database.Database, logger?: Logger | null) {
  const version = getSchemaVersionFromDB(db);
  if (version) {
    commonLog(logger, 'info', 'DB', `DB schema version: ${version}`);
  } else {
    commonLog(
      logger,
      'warn',
      'DB',
      'Failed to obtain DB schema version. Database could be corrupted!'
    );
    return;
  }

  if (semver.lt(DB_SCHEMA_VERSION, version)) {
    throw Error(`DB schema version v${version} is newer than v${DB_SCHEMA_VERSION} supported by this version of patreon-dl. Update patreon-dl and try again.`);
  }
  if (semver.gt(DB_SCHEMA_VERSION, version)) {
    await updateDB(db, version, logger);
    commonLog(
      logger,
      'info',
      'DB',
      `Updated DB schema version: ${getSchemaVersionFromDB(db)}`
    );
  }
}

function getSchemaVersionFromDB(db: Database.Database) {
  const result = db
    .prepare(`SELECT value FROM env WHERE env_key = ?`)
    .get('db_schema_version') as { value: string } | undefined;
  return result?.value || '';
}