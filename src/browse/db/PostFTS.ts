import { type Database } from 'better-sqlite3';
import { stripHtml } from 'string-strip-html';
import type Logger from '../../utils/logging/Logger.js';
import { type Post } from '../../entities';

const POST_FTS_SOURCE_DELETE_SQL = `DELETE FROM post_fts_source WHERE post_id = old.content_id;`;
const POST_FTS_SOURCE_INSERT_SQL = `
  INSERT INTO post_fts_source(post_id, title, body)
  VALUES(
    new.content_id,
    json_extract(new.details, '$.title'),
    json_extract(new.details, '$.contentText')
  );
`;
const POST_FTS_DELETE_SQL = `DELETE FROM post_fts WHERE rowid = old.fts_rowid;`;
const POST_FTS_INSERT_SQL = `
  INSERT INTO post_fts(rowid, title, body)
  VALUES (
    new.fts_rowid,
    new.title,
    new.body
  );
`;
const POST_FTS_INIT = `
  CREATE TABLE IF NOT EXISTS "post_fts_source" (
    "fts_rowid" INTEGER,
    "post_id" TEXT NOT NULL,
    "title"	TEXT,
    "body" TEXT,
    PRIMARY KEY("fts_rowid"),
    FOREIGN KEY("post_id") REFERENCES "content"("content_id")
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS post_fts USING fts5(
    title,
    body,
    content = 'post_fts_source',
    content_rowid = 'fts_rowid'
  );

  CREATE TRIGGER IF NOT EXISTS content_post_ai
  AFTER INSERT ON content
  WHEN new.content_type = 'post'
  BEGIN
    ${POST_FTS_SOURCE_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS content_post_au
  AFTER UPDATE ON content
  WHEN new.content_type = 'post'
  BEGIN
    ${POST_FTS_SOURCE_DELETE_SQL}
    ${POST_FTS_SOURCE_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS content_post_ad
  AFTER DELETE ON content
  WHEN old.content_type = 'post'
  BEGIN
    ${POST_FTS_SOURCE_DELETE_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS post_fts_source_ai AFTER INSERT ON post_fts_source BEGIN
    ${POST_FTS_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS post_fts_source_bu BEFORE UPDATE ON post_fts_source BEGIN
    ${POST_FTS_DELETE_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS post_fts_source_au AFTER UPDATE ON post_fts_source BEGIN
    ${POST_FTS_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS post_fts_source_bd BEFORE DELETE ON post_fts_source BEGIN
    ${POST_FTS_DELETE_SQL}
  END;
`;

export function initDBPostFTS(db: Database) {
  db.exec(POST_FTS_INIT);
}


export function buildPostFTS(db: Database, logger?: Logger | null) {
  logger?.log({
    originator: 'DB',
    level: 'info',
    message: ['Rebuild FTS for posts']
  });
  logger?.log({
    originator: 'DB',
    level: 'debug',
    message: ['Clear "post_fts_source" table']
  });
  db.exec('DELETE FROM post_fts_source');

  // Update `contentText` of each post in DB
  // The update will cause `content_post_au` TRIGGER to run
  const initialSelectStmt = db.prepare<[], { content_id: string; details: string }>(`
    SELECT content_id, details
    FROM content
    WHERE content_type = 'post'
    ORDER BY content_id
    LIMIT 100`);
  const selectStmt = db.prepare<[string], { content_id: string; details: string }>(`
    SELECT content_id, details
    FROM content
    WHERE content_id > ? AND content_type = 'post'
    ORDER BY content_id
    LIMIT 100`);
  const updateStmt = db.prepare<[string, string]>(`
    UPDATE content
    SET details = ?
    WHERE content_id = ? AND content_type='post'`);
  let postsUpdated = 0;
  let postsFailed = 0;
  logger?.log({
    originator: 'DB',
    level: 'debug',
    message: ['Get first batch of posts']
  });
  let rows = initialSelectStmt.all();
  while(rows.length > 0) {
    let lastUpdatedPostId: string | null = null;
    for (const row of rows) {
      try {
        const post = JSON.parse(row.details) as Post;
        post.contentText = stripHtml(post.content || '').result;
        logger?.log({
          originator: 'DB',
          level: 'debug',
          message: [`Update post #${post.id}`]
        });
        updateStmt.run(JSON.stringify(post), row.content_id);
        postsUpdated++;
        lastUpdatedPostId = post.id;
      }
      catch (error) {
        logger?.log({
          originator: 'DB',
          level: 'error',
          message: ['Failed to update post:', error]
        });
        postsFailed++;
      }
    }
    if (lastUpdatedPostId) {
      logger?.log({
        originator: 'DB',
        level: 'debug',
        message: [`Get next batch of posts (> #${lastUpdatedPostId})`]
      });
      rows = selectStmt.all(lastUpdatedPostId);
    }
    else {
      logger?.log({
        originator: 'DB',
        level: 'warn',
        message: ['Could not determine starting ID of next batch of posts - rebuild not complete']
      });
      rows = [];
    }
  }

  logger?.log({
    originator: 'DB',
    level: 'info',
    message: [`Rebuild FTS for posts - done (posts updated: ${postsUpdated}; failed: ${postsFailed})`]
  });
}