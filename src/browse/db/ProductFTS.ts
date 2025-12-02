import { type Database } from 'better-sqlite3';
import { stripHtml } from 'string-strip-html';
import type Logger from '../../utils/logging/Logger.js';
import { type Product } from '../../entities';

const PRODUCT_FTS_SOURCE_DELETE_SQL = `DELETE FROM product_fts_source WHERE product_id = old.content_id;`;
const PRODUCT_FTS_SOURCE_INSERT_SQL = `
  INSERT INTO product_fts_source(product_id, title, body)
  VALUES(
    new.content_id,
    json_extract(new.details, '$.name'),
    json_extract(new.details, '$.descriptionText')
  );
`;
const PRODUCT_FTS_DELETE_SQL = `DELETE FROM product_fts WHERE rowid = old.fts_rowid;`;
const PRODUCT_FTS_INSERT_SQL = `
  INSERT INTO product_fts(rowid, title, body)
  VALUES (
    new.fts_rowid,
    new.title,
    new.body
  );
`;
const PRODUCT_FTS_INIT = `
  CREATE TABLE IF NOT EXISTS "product_fts_source" (
    "fts_rowid" INTEGER,
    "product_id" TEXT NOT NULL,
    "title"	TEXT,
    "body" TEXT,
    PRIMARY KEY("fts_rowid"),
    FOREIGN KEY("product_id") REFERENCES "content"("content_id")
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS product_fts USING fts5(
    title,
    body,
    content = 'product_fts_source',
    content_rowid = 'fts_rowid'
  );

  CREATE TRIGGER IF NOT EXISTS content_product_ai
  AFTER INSERT ON content
  WHEN new.content_type = 'product'
  BEGIN
    ${PRODUCT_FTS_SOURCE_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS content_product_au
  AFTER UPDATE ON content
  WHEN new.content_type = 'product'
  BEGIN
    ${PRODUCT_FTS_SOURCE_DELETE_SQL}
    ${PRODUCT_FTS_SOURCE_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS content_product_ad
  AFTER DELETE ON content
  WHEN old.content_type = 'product'
  BEGIN
    ${PRODUCT_FTS_SOURCE_DELETE_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS product_fts_source_ai AFTER INSERT ON product_fts_source BEGIN
    ${PRODUCT_FTS_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS product_fts_source_bu BEFORE UPDATE ON product_fts_source BEGIN
    ${PRODUCT_FTS_DELETE_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS product_fts_source_au AFTER UPDATE ON product_fts_source BEGIN
    ${PRODUCT_FTS_INSERT_SQL}
  END;

  CREATE TRIGGER IF NOT EXISTS product_fts_source_bd BEFORE DELETE ON product_fts_source BEGIN
    ${PRODUCT_FTS_DELETE_SQL}
  END;
`;

export function initDBProductFTS(db: Database) {
  db.exec(PRODUCT_FTS_INIT);
}

export function buildProductFTS(db: Database, logger?: Logger | null) {
  logger?.log({
    originator: 'DB',
    level: 'info',
    message: ['Rebuild FTS for products']
  });
  logger?.log({
    originator: 'DB',
    level: 'debug',
    message: ['Clear "product_fts_source" table']
  });
  db.exec('DELETE FROM product_fts_source');

  // Update `contentText` of each product in DB
  // The update will cause `content_product_au` TRIGGER to run
  const initialSelectStmt = db.prepare<[], { content_id: string; details: string }>(`
    SELECT content_id, details
    FROM content
    WHERE content_type = 'product'
    ORDER BY content_id
    LIMIT 100`);
  const selectStmt = db.prepare<[string], { content_id: string; details: string }>(`
    SELECT content_id, details
    FROM content
    WHERE content_id > ? AND content_type = 'product'
    ORDER BY content_id
    LIMIT 100`);
  const updateStmt = db.prepare<[string, string]>(`
    UPDATE content
    SET details = ?
    WHERE content_id = ? AND content_type='product'`);
  let productsUpdated = 0;
  let productsFailed = 0;
  logger?.log({
    originator: 'DB',
    level: 'debug',
    message: ['Get first batch of products']
  });
  let rows = initialSelectStmt.all();
  while(rows.length > 0) {
    let lastUpdatedProductId: string | null = null;
    for (const row of rows) {
      try {
        const product = JSON.parse(row.details) as Product;
        product.descriptionText = stripHtml(product.description || '').result;
        logger?.log({
          originator: 'DB',
          level: 'debug',
          message: [`Update product #${product.id}`]
        });
        updateStmt.run(JSON.stringify(product), row.content_id);
        productsUpdated++;
        lastUpdatedProductId = product.id;
      }
      catch (error) {
        logger?.log({
          originator: 'DB',
          level: 'error',
          message: ['Failed to update product:', error]
        });
        productsFailed++;
      }
    }
    if (lastUpdatedProductId) {
      logger?.log({
        originator: 'DB',
        level: 'debug',
        message: [`Get next batch of products (> #${lastUpdatedProductId})`]
      });
      rows = selectStmt.all(lastUpdatedProductId);
    }
    else {
      logger?.log({
        originator: 'DB',
        level: 'warn',
        message: ['Could not determine starting ID of next batch of products - rebuild not complete']
      });
      rows = [];
    }
  }

  logger?.log({
    originator: 'DB',
    level: 'info',
    message: [`Rebuild FTS for products - done (products updated: ${productsUpdated}; failed: ${productsFailed})`]
  });
}
