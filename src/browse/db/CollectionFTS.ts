import { type Database } from "better-sqlite3";

const COLLECTION_FTS_SOURCE_DELETE_SQL = `DELETE FROM collection_fts_source WHERE collection_id = old.collection_id;`;
const COLLECTION_FTS_SOURCE_INSERT_SQL = `
  INSERT INTO collection_fts_source(collection_id, title, body)
  VALUES(
    new.collection_id,
    json_extract(new.details, '$.title'),
    json_extract(new.details, '$.description')
  );
`;
const COLLECTION_FTS_DELETE_SQL = `DELETE FROM collection_fts WHERE rowid = old.fts_rowid;`;
const COLLECTION_FTS_INSERT_SQL = `
  INSERT INTO collection_fts(rowid, title, body)
  VALUES (
    new.fts_rowid,
    new.title,
    new.body
  );
`;
const COLLECTION_FTS_INIT = `
  CREATE TABLE IF NOT EXISTS "collection_fts_source" (
    "fts_rowid" INTEGER,
    "collection_id" TEXT NOT NULL,
    "title"	TEXT,
    "body" TEXT,
    PRIMARY KEY("fts_rowid"),
    FOREIGN KEY("collection_id") REFERENCES "collection"("collection_id")
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS collection_fts USING fts5(
    title,
    body,
    content = 'collection_fts_source',
    content_rowid = 'fts_rowid'
  );

  CREATE TRIGGER IF NOT EXISTS collection_ai AFTER INSERT ON collection BEGIN
    ${COLLECTION_FTS_SOURCE_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS collection_au AFTER UPDATE ON collection BEGIN
    ${COLLECTION_FTS_SOURCE_DELETE_SQL}
    ${COLLECTION_FTS_SOURCE_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS collection_ad AFTER DELETE ON collection BEGIN
    ${COLLECTION_FTS_SOURCE_DELETE_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS collection_fts_source_ai AFTER INSERT ON collection_fts_source BEGIN
    ${COLLECTION_FTS_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS collection_fts_source_bu BEFORE UPDATE ON collection_fts_source BEGIN
    ${COLLECTION_FTS_DELETE_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS collection_fts_source_au AFTER UPDATE ON collection_fts_source BEGIN
    ${COLLECTION_FTS_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS collection_fts_source_bd BEFORE DELETE ON collection_fts_source BEGIN
    ${COLLECTION_FTS_DELETE_SQL}
  END;
`;

export function initDBCollectionFTS(db: Database) {
  db.exec(COLLECTION_FTS_INIT);
}