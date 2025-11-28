import { type Comment, type Downloadable, type Post, type Product, type Tier, type Campaign } from '../../entities';
import { type PostTag, type Collection } from '../../entities/Post';
import { getYearMonthString, type KeysOfValue } from '../../utils/Misc.js';
import { type GetContentContext, type GetPreviousNextContentResult, type ContentList, type ContentType, type GetContentListParams, type PostWithComments, type ContentListSortBy, type GetCollectionListParams, type CollectionList, type GetPostTagListParams, type PostTagList } from '../types/Content.js';
import { type CampaignDBConstructor } from './CampaignDBMixin.js';

export function ContentDBMixin<TBase extends CampaignDBConstructor>(Base: TBase) {
  return class ContentDB extends Base {
    saveContent(content: Post | Product) {
      const title = content.type === 'post' ? content.title : content.name;
      this.log('debug', `Save ${content.type} #${content.id} (${title}) to DB`);
      try {
        // Normally, campaign would have already been saved to DB via
        // downloader logic, but we should still save it one more
        // time just in case. Difference is, we do not overwrite 
        // DB entry if it already exists.
        this.saveCampaign(content.campaign, new Date(), false);

        const contentExists = this.checkContentExists(content.id, content.type, content.campaign);
        this.exec('BEGIN TRANSACTION');

        if (!contentExists) {
          this.log('debug', `INSERT ${content.type} "${title}" (${content.id})`);
          this.run(
            `
            INSERT INTO content (
              content_id,
              content_type,
              campaign_id,
              title,
              content_subtype,
              is_viewable,
              published_at,
              details
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              content.id,
              content.type,
              content.campaign?.id || '-1',
              title,
              content.type === 'post' ? content.postType : content.productType || null,
              (content.type === 'post' ? content.isViewable : content.isAccessible) ? 1 : 0,
              this.#publishedAtToTime(content.publishedAt),
              JSON.stringify(content)
            ]
          );
        } else {
          this.log('debug', `${content.type} #${content.id} already exists in DB - update record`);
          this.run(`
            UPDATE content
            SET
              content_type = ?,
              campaign_id = ?,
              title = ?,
              content_subtype = ?,
              is_viewable = ?,
              published_at = ?,
              details = ?
            WHERE content_id = ?
            `,
            [
              content.type,
              content.campaign?.id || '-1',
              title,
              content.type === 'post' ? content.postType : content.productType || null,
              (content.type === 'post' ? content.isViewable : content.isAccessible) ? 1 : 0,
              this.#publishedAtToTime(content.publishedAt),
              JSON.stringify(content),
              content.id
            ]
          );
        }

        // Save content media
        this.#saveContentMedia(content);

        // Save tiers and collections and tags
        if (content.type === 'post') {
          this.#savePostTiers(content);
          this.#savePostCollection(content);
          this.#savePostTags(content);
        }

        this.exec('COMMIT');
      } catch (error) {
        this.log(
          'error',
          `Failed to save content "${title}" (${content.id}) to DB:`,
          error
        );
        this.exec('ROLLBACK');
      }
    }

    #saveContentMedia(
      content: Post | Product
    ) {
      this.log('debug', `Save media for ${content.type} #${content.id} to DB`);
      switch (content.type) {
        case 'post':
          this.#savepostMedia(content);
          break;
        case 'product':
          this.#saveProductMedia(content);
          break;
      }
    }

    #savepostMedia(post: Post) {
      const mediaProps: KeysOfValue<Post, Downloadable | Downloadable[] | null>[] = [
        'embed',
        'attachments',
        'audio',
        'audioPreview',
        'images',
        'videoPreview',
        'video'
      ];
      if (post.coverImage) {
        this.saveMedia(post.coverImage);
      }
      if (post.thumbnail) {
        this.saveMedia(post.thumbnail);
      }
      for (const prop of mediaProps) {
        if (post[prop]) {
          const data = post[prop];
          const downloadables = (Array.isArray(data) ? data : [data])
            .filter((data) => data !== undefined);
          downloadables.forEach((dl, index) => this.#doSaveContentMedia(
            post,
            dl,
            index,
            prop === 'audioPreview'||
            prop === 'videoPreview' ||
            (prop === 'images' && !post.isViewable)
          ));
        }
      }
    }

    #saveProductMedia(product: Product) {
      const mediaProps: KeysOfValue<Product, Downloadable[]>[] = [
        'contentMedia',
        'previewMedia'
      ];
      for (const prop of mediaProps) {
        if (product[prop]) {
          const data = product[prop];
          const downloadables = (Array.isArray(data) ? data : [data])
            .filter((data) => data !== undefined);
          downloadables.forEach((dl, index) => this.#doSaveContentMedia(
            product,
            dl,
            index,
            prop === 'previewMedia'
          ));
        }
      }
    }

    #doSaveContentMedia(
      content: Post | Product,
      media: Downloadable,
      mediaIndex: number,
      isPreview: boolean
    ) {
      if (!media.downloaded || !media.downloaded.path) {
        return;
      }
      this.log('debug',
        `Save ${content.type} media to DB`,
        `(${content.type} ID: ${content.id}, media ID: ${media.id})`
      );
      this.saveMedia(media);
      try {
        const contentMediaExists = this.checkContentMediaExists(content, media);
        if (!contentMediaExists) {
          this.run(
            `
            INSERT INTO content_media (
              media_id,
              content_id,
              content_type,
              media_index,
              campaign_id,
              is_preview
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              media.id,
              content.id,
              content.type,
              mediaIndex,
              content.campaign?.id || '-1',
              isPreview ? 1 : 0
            ]
          );
        }
        else {
          this.log('debug',
            `${content.type} media already exists in DB`,
            `(${content.type} ID: ${content.id}, media ID: ${media.id})`,
            '- update record'
          );
          this.run(
            `
            UPDATE content_media
            SET
              content_id = ?,
              content_type = ?,
              media_index = ?,
              campaign_id = ?,
              is_preview = ?
            WHERE
              media_id = ?
            `,
            [
              content.id,
              content.type,
              mediaIndex,
              content.campaign?.id || '-1',
              isPreview ? 1 : 0,
              media.id,
            ]
          );
        }
      }
      catch (error) {
        this.log(
          'error',
          `Failed to save content media (type: ${content.type}, content_id: ${content.id}, media_id: ${media.id}) to DB:`,
          error
        );
        throw error;
      }
    }

    #publishedAtToTime(publishedAt: string | null) {
      try {
        if (!publishedAt) {
          return null;
        }
        return new Date(publishedAt).getTime();
      }
      catch (error) {
        this.log('warn', `Failed to convert publishedAt value "${publishedAt}" to date integer:`, error);
        return null;
      }
    }

    #savePostTiers(post: Post) {
      this.log('debug', `Save tiers for post #${post.id} to DB`);
      // Clear existing tiers for post
      this.log('debug', `Clear existing tiers in DB for post #${post.id} before saving current ones`);
      this.run(`DELETE FROM post_tier WHERE post_id = ?`, [
        post.id
      ]);
      post.tiers.forEach((tier) => this.#doSaveTier(post, tier));
    }

    #doSaveTier(post: Post, tier: Tier) {
      this.log('debug', `Add post tier #${tier.id} (${tier.title}) to DB`);
      this.run(`
        INSERT INTO post_tier (
          post_id,
          tier_id,
          campaign_id
        )
        VALUES (?, ?, ?)
      `,
      [
        post.id,
        tier.id,
        post.campaign?.id || '-1'
      ]);
    }

    savePostComments(post: Post, comments: Comment[]) {
      try {
        this.log('debug', `Save comments for post #${post.id}`);
        const commentsExist = this.checkPostCommentsExist(post);
        if (!commentsExist) {
          this.run(
            `
            INSERT INTO post_comments (
              post_id,
              comment_count,
              comments
            )
            VALUES (?, ?, ?)
            `,
            [
              post.id,
              post.commentCount,
              JSON.stringify(comments)
            ]
          );
        }
        else {
          this.log('debug', `Comments for post #${post.id} already exists in DB - update record`);
          this.run(
            `
            UPDATE post_comments
            SET
              comment_count = ?,
              comments = ?
            WHERE
              post_id = ?
            `,
            [
              post.commentCount,
              JSON.stringify(comments),
              post.id
            ]
          );
        }
      }
      catch (error) {
        this.log(
          'error',
          `Failed to save comments for post #${post.id} to DB:`,
          error
        );
        throw error;
      }
    }

    checkPostCommentsExist(post: Post) {
      try {
        const result = this.get(
          `
          SELECT COUNT(*) as count
          FROM post_comments
          WHERE
            post_id = ?
          `,
          [ post.id ]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if comments for post #${post.id} exist in DB:`,
          error
        );
        return false;
      }
    }

    getContent(id: string, contentType: 'post'): PostWithComments | null;
    getContent(id: string, contentType: 'product'): Product | null;
    getContent(id: string, contentType: ContentType) {
      this.log('debug', `Get ${contentType} #${id} from DB`);
      const result = this.get(
        `
        SELECT
          details,
          IFNULL(post_comments.comment_count, 0) AS comment_count,
          comments
        FROM
          content
        LEFT JOIN
          post_comments ON post_comments.post_id = content.content_id AND content.content_type = 'post'
        WHERE
          content_id = ? AND content_type = ?`,
        [id, contentType]
      );
      return result ? this.#parseContentRowJoinedComments(result) : null;
    }

    getPreviousNextContent<T extends ContentType>(
      content: Post | Product,
      context: GetContentContext<T>
    ): GetPreviousNextContentResult<T> {
      let previousWhere: string;
      let previousSortBy: ContentListSortBy;
      let nextWhere: string;
      let nextSortBy: ContentListSortBy;
      let whereValues: any[];
      const sortBy = context.sortBy ?? 'latest';
      const publishedAt = this.#publishedAtToTime(content.publishedAt);
      const title = content.type === 'post' ? content.title : content.name;
      switch (sortBy) {
        case 'a-z':
        case 'z-a': {
          const p = `
            (
              (title < ?)
              OR
              (title = ? AND published_at > ?)
              OR
              (title = ? AND published_at = ? AND content_id > ?)
            )
          `;
          const n = `
            (
              (title > ?)
              OR
              (title = ? AND published_at < ?)
              OR
              (title = ? AND published_at = ? AND content_id < ?)
            )
          `;
          whereValues = [title, title, publishedAt, title, publishedAt, content.id];
          if (sortBy === 'a-z') {
            previousWhere = p;
            previousSortBy = 'z-a';
            nextWhere = n;
            nextSortBy = 'a-z';
          }
          else { // z-a
            previousWhere = n;
            previousSortBy = 'a-z';
            nextWhere = p;
            nextSortBy = 'z-a';
          }
          break;
        }
        case 'latest':
        case 'oldest':
        case 'best_match': {
          const older = `
            (
              (published_at < ?)
              OR
              (published_at = ? AND content_id < ?)
            )
          `;
          const newer = `
            (
              (published_at > ?)
              OR
              (published_at = ? AND content_id > ?)
            )
          `;
          whereValues = [publishedAt, publishedAt, content.id];
          if (sortBy === 'latest') {
            previousWhere = newer;
            previousSortBy = 'oldest';
            nextWhere = older;
            nextSortBy = 'latest';
          }
          else { // oldest
            previousWhere = older;
            previousSortBy = 'latest';
            nextWhere = newer;
            nextSortBy = 'oldest';
          }
          break;
        }
      }
      const previous = (this.getContentList(
        {
          ...context,
          search: context.search,
          sortBy: previousSortBy,
          limit: 1, offset: 0
        },
        {
          whereClauses: [previousWhere],
          whereValues
        },
        false
      )).items[0] || null;
      const next = (this.getContentList(
        {
          ...context,
          search: context.search,
          sortBy: nextSortBy,
          limit: 1, offset: 0
        },
        {
          whereClauses: [nextWhere],
          whereValues
        },
        false
      )).items[0] || null;

      return {
        previous,
        next
      } as GetPreviousNextContentResult<T>;
    }

    getContentList<T extends ContentType>(
      params: GetContentListParams<T>,
      db?: { whereClauses: string[]; whereValues: any[]; },
      includeTotal = true
    ): ContentList<T> {
      const { campaign, type: contentType, isViewable, datePublished, search, sortBy, limit, offset } = params;
      const { whereClauses: extraWhereClauses = [], whereValues: extraWhereValues = [] } = db || {};
      const campaignId = !campaign ? null : (typeof campaign === 'string' ? campaign : campaign.id);
      const tiers = params.type === 'post' ? (params as GetContentListParams<'post'>).tiers : null;
      const collection = params.type === 'post' ? (params as GetContentListParams<'post'>).collection : null;
      const tag = params.type === 'post' ? (params as GetContentListParams<'post'>).tag : null;
      this.log('debug', `Get ${contentType}s from DB:`, {
        campaign: campaignId,
        isViewable,
        datePublished,
        search,
        tiers: params.type === 'post' ? JSON.stringify(tiers) : 'N/A',
        collection: params.type === 'post' ? JSON.stringify(collection) : 'N/A',
        tag: params.type === 'post' ? JSON.stringify(tag) : 'N/A',
        sortBy,
        limit,
        offset
      });
      const contentSubtypes = params.type === 'post' ? (params as GetContentListParams<'post'>).postTypes : null;
      if (tiers && tiers.length > 0 && !campaign) {
        throw Error('Invalid params: "tiers" must be used with "campaign"');
      }
      if (search && !contentType) {
        throw Error('Invalid params: "search" must be used with "contentType"');
      }
      const joinParts: string[] = [];
      if (tiers && tiers.length > 0) {
        joinParts.push('LEFT JOIN post_tier ON post_tier.post_id = content.content_id');
      }
      if (collection) {
        joinParts.push(`LEFT JOIN post_collection ON post_collection.post_id = content.content_id`);
      }
      if (tag) {
        joinParts.push(`LEFT JOIN post_tag_post ON post_tag_post.post_id = content.content_id AND post_tag_post.campaign_id = content.campaign_id`);
      }
      const join = joinParts.join(' ');
      const whereEquals: { column: string; value: string | number; }[] = [];
      if (campaignId) {
        whereEquals.push({ column: 'content.campaign_id', value: campaignId });
      }
      if (contentType) {
        whereEquals.push({ column: 'content_type', value: contentType });
      }
      if (isViewable !== undefined) {
        whereEquals.push({ column: 'is_viewable', value: isViewable ? 1 : 0});
      }
      if (datePublished) {
        const strftimeFormat =
          /^\d{4}$/.test(datePublished) ? '%Y' :
          /^\d{4}-\d{2}$/.test(datePublished) ? '%Y-%m'
          : null;
        if (!strftimeFormat) {
          throw Error('Invalid params: "datePublished" must be in format "YYYY" or "YYYY-MM" (e.g. "2025-06")');
        }
        whereEquals.push({
          column: `strftime('${strftimeFormat}', datetime(published_at / 1000, 'unixepoch'))`,
          value: datePublished
        });
      }
      if (collection) {
        whereEquals.push({
          column: 'post_collection.collection_id',
          value: typeof collection === 'string' ? collection : collection.id
        });
      }
      if (tag) {
        whereEquals.push({
          column: 'post_tag_post.post_tag_id',
          value: typeof tag === 'string' ? tag : tag.id
        });
      }
      const whereIns: { column: string; values: (string | number)[] }[] = [];
      if (contentSubtypes && contentSubtypes.length > 0) {
        whereIns.push({ column: 'content_subtype', values: contentSubtypes})
      }
      if (tiers && tiers.length > 0) {
        const ids = tiers.map((tier) => typeof tier === 'string' ? tier : tier.id);
        whereIns.push({ column: 'tier_id', values: ids });
      }
      const whereClauseParts: string[] = [];
      if (whereEquals.length > 0) {
        whereClauseParts.push(...whereEquals.map(({column: field}) => `${field} = ?` ));
      }
      if (whereIns.length > 0) {
        whereClauseParts.push(...whereIns.map((wi) => `${wi.column} IN (${wi.values.map(() => '?').join(', ')})`));
      }
      if (search) {
        whereClauseParts.push(`${contentType}_fts MATCH ?`);
      }
      whereClauseParts.push(...extraWhereClauses);
      const whereClause = whereClauseParts.length > 0 ? 'WHERE ' + whereClauseParts.join(' AND ') : '';
      const whereValues = [
        ...whereEquals.map(({value}) => value),
        ...whereIns.reduce<(string | number)[]>((result, {values}) => {
          result.push(...values);
          return result;
        }, [])
      ];
      if (search) {
        whereValues.push(search);        
      }
      whereValues.push(...extraWhereValues);
      let orderByClause: string;
      switch (sortBy) {
        case 'a-z':
          orderByClause = 'title ASC';
          break;
        case 'z-a':
          orderByClause = 'title DESC';
          break;
        case 'latest':
          orderByClause = 'published_at DESC';
          break;
        case 'oldest':
          orderByClause = 'published_at ASC';
          break;
        case 'best_match':
          orderByClause = `ORDER BY bm25(${contentType}_fts) DESC`;
          break;
        default:
          orderByClause = '';
      }
      if (orderByClause) {
        orderByClause = `ORDER BY ${orderByClause}`;
      }
      let limitOffsetClause = '';
      const limitOffsetValues: number[] = [];
      if (limit !== undefined && offset !== undefined) {
        limitOffsetClause = 'LIMIT ? OFFSET ?';
        limitOffsetValues.push(limit, offset);
      }
      else if (limit !== undefined) {
        limitOffsetClause = 'LIMIT ?';
        limitOffsetValues.push(limit);
      }

      let fromClause: string;
      if (search) {
        fromClause = `
          FROM
            ${contentType}_fts
          LEFT JOIN
            ${contentType}_fts_source ON ${contentType}_fts_source.fts_rowid = ${contentType}_fts.rowid
          LEFT JOIN
            content ON content.content_id = ${contentType}_fts_source.${contentType}_id
        `;
      } else {
        fromClause = 'FROM content';
      }

      const rows = this.all(
        `
        SELECT DISTINCT
          details,
          IFNULL(post_comments.comment_count, 0) AS comment_count,
          comments
        ${fromClause}
        LEFT JOIN
          post_comments ON post_comments.post_id = content.content_id AND content.content_type = 'post'
        ${join}
        ${whereClause}
        ${orderByClause}
        ${limitOffsetClause}
        `,
        [ ...whereValues, ...limitOffsetValues ]
      );
      const items = rows.map<T extends 'post' ? PostWithComments : T extends 'product' ? Product : PostWithComments | Product>((row) => this.#parseContentRowJoinedComments(row));
      const totalResult = includeTotal ? this.get(
          `SELECT COUNT(*) AS content_count ${fromClause} ${join} ${whereClause}`,
          [...whereValues]
      ) : null;
      const total = totalResult ? (totalResult.content_count as number) : 0;
      return {
        items,
        total
      };
    }

    /**
     * 
     * @param row Must have `details`, `comment_count` and `comments`
     * @returns 
     */
    #parseContentRowJoinedComments(row: any) {
      const details = JSON.parse(row.details);
      if (!Reflect.has(details, 'type')) {
        return details;
      }
      switch (details.type) {
        case 'post': {
          const commentCount = row.comment_count;
          const comments = row.comments !== null ? JSON.parse(row.comments) : null;
          return {
            ...details,
            commentCount,
            comments
          } satisfies PostWithComments;
        }
        case 'product':
        default:
          return details;
      }
    }

    getContentCountByDate(
      contentType: ContentType,
      groupBy: 'year' | 'month',
      filter?: {
        campaign?: Campaign | string | null,
        date?: Date | null}
    ) {
      const campaign = filter?.campaign || null;
      const campaignId = !campaign ? null : (typeof campaign === 'string' ? campaign : campaign.id);
      this.log('debug', `Get ${contentType} count by date:`, {
        groupBy,
        filter: !filter ? null : {
          campaign: campaignId,
          date: filter.date
        }
      });
      const date = filter?.date || null;
      const whereClauseParts = ['content_type = ?'];
      const whereValues: string[] = [contentType];
      if (campaignId) {
        whereClauseParts.push('campaign_id = ?');
        whereValues.push(campaignId);
      }
      if (date) {
        whereClauseParts.push(`dt = ?`);
        const value = groupBy === 'year' ?
          String(date.getUTCFullYear())
          : getYearMonthString(date);
        whereValues.push(String(value));
      }
      const whereClause = `WHERE ${whereClauseParts.join(' AND ')}`;
      const strftimeFormat = groupBy === 'year' ? '%Y' : '%Y-%m'
      const rows = this.all(
        `
        SELECT
          COUNT(content_id) AS content_count,
          strftime('${strftimeFormat}',
          datetime(published_at / 1000, 'unixepoch')) AS dt
        FROM
          content
        ${whereClause}
        GROUP BY dt
        ORDER BY dt DESC
        `,
        [...whereValues]
      );
      return rows.map((row) => ({
        dt: row.dt as string,
        count: row.content_count as number
      }));
    }

    getPostCountByType(campaign: Campaign | string) {
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
      this.log('debug', `Get post count by type for campaign #${campaignId}`);
      const rows = this.all(
        `
        SELECT
          COUNT(content_id) AS post_count, content_subtype AS post_type
        FROM
          content
        WHERE
          content_type = 'post' AND campaign_id = ?
        GROUP BY content_subtype 
        `,
        [campaignId]
      );
      return rows.map((row) => ({
        postType: row.post_type as string,
        count: row.post_count as number
      }));
    }

    getPostCountByTier(campaign: Campaign | string) {
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
      this.log('debug', `Get post count by tier for campaign #${campaignId}`);
      const rows = this.all(
        `
        SELECT
          COUNT(post_id) as post_count, tier_id, reward.title
        FROM post_tier
          RIGHT JOIN reward ON reward.reward_id = post_tier.tier_id AND reward.campaign_id = post_tier.campaign_id
        WHERE
          post_tier.campaign_id = ?
        GROUP BY
          tier_id
        `,
        [campaignId]
      );
      return rows.map((row) => ({
        tierId: row.tier_id as string,
        title: row.title as string,
        count: row.post_count as number
      }));
    }

    checkContentExists(id: string, contentType: ContentType, campaign: Campaign | null) {
      this.log('debug', `Check if ${contentType} #${id} exists in DB`);
      try {
        const result = this.get(
          `
          SELECT COUNT(*) as count
          FROM content
          WHERE
            content_id = ? AND
            content_type = ? AND
            campaign_id = ?
          `,
          [ id, contentType, campaign?.id || '-1' ]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if ${contentType} #${id} exists in DB:`,
          error
        );
        return false;
      }
    }

    saveCollection(collection: Collection, campaign: Campaign | null, overwriteIfExists = true) {
      this.log('debug', `Save collection #${collection.id} (${collection.title}) to DB`);
      try {
        // Normally, campaign would have already been saved to DB via
        // downloader logic, but we should still save it one more
        // time just in case. Difference is, we do not overwrite 
        // DB entry if it already exists.
        this.saveCampaign(campaign, new Date(), false);

        const collectionExists = this.checkCollectionExists(collection.id);
        if (collectionExists && !overwriteIfExists) {
          return;
        }

        if (collection.thumbnail) {
          this.saveMedia(collection.thumbnail);
        }

        if (!collectionExists) {
          this.log('debug', `INSERT collection "${collection.title}" (${collection.id})`);
          this.run(
            `
            INSERT INTO collection (
              collection_id,
              campaign_id,
              title,
              created_at,
              edited_at,
              details
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              collection.id,
              campaign?.id || '-1',
              collection.title,
              this.#publishedAtToTime(collection.createdAt),
              this.#publishedAtToTime(collection.editedAt),
              JSON.stringify(collection)
            ]
          );
        } else {
          this.log('debug', `Collection #${collection.id} already exists in DB - update record`);
          this.run(`
            UPDATE collection
            SET
              title = ?,
              created_at = ?,
              edited_at = ?,
              details = ?
            WHERE
              collection_id = ? AND
              campaign_id = ?
            `,
            [
              collection.title,
              this.#publishedAtToTime(collection.createdAt),
              this.#publishedAtToTime(collection.editedAt),
              JSON.stringify(collection),
              collection.id,
              campaign?.id || '-1'
            ]
          );
        }
      } catch (error) {
        this.log(
          'error',
          `Failed to save collection "${collection.title}" (${collection.id}) to DB:`,
          error
        );
      }
    }

    savePostTag(tag: PostTag, campaign: Campaign | null, overwriteIfExists = true) {
      this.log('debug', `Save post_tag "${tag.id}" to DB`);
      try {
        // Normally, campaign would have already been saved to DB via
        // downloader logic, but we should still save it one more
        // time just in case. Difference is, we do not overwrite 
        // DB entry if it already exists.
        this.saveCampaign(campaign, new Date(), false);

        const tagExists = this.checkPostTagExists(tag.id, campaign);
        if (tagExists && !overwriteIfExists) {
          return;
        }

        if (!tagExists) {
          this.log('debug', `INSERT post_tag "${tag.id}"`);
          this.run(
            `
            INSERT INTO post_tag (
              post_tag_id,
              campaign_id,
              value,
              details
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              tag.id,
              campaign?.id || '-1',
              tag.value,
              JSON.stringify(tag)
            ]
          );
        } else {
          this.log('debug', `post_tag "${tag.id}" already exists in DB - update record`);
          this.run(`
            UPDATE post_tag
            SET
              value = ?,
              details = ?
            WHERE
              post_tag_id = ? AND
              campaign_id = ?
            `,
            [
              tag.value,
              JSON.stringify(tag),
              tag.id,
              campaign?.id || '-1'
            ]
          );
        }
      } catch (error) {
        this.log(
          'error',
          `Failed to save post_tag "${tag.id}" to DB:`,
          error
        );
      }
    }

    getCollection(id: string) {
      this.log('debug', `Get collection #${id} from DB`);
      try {
        const result = this.get(
          `
          SELECT
            campaign_id,
            details,
            (SELECT COUNT(post_id) AS post_count FROM post_collection WHERE collection_id = ?) AS post_count
          FROM collection
          WHERE collection_id = ?;
          `,
          [id, id]
        );
        if (result) {
          const collection = JSON.parse(result.details) as Collection;
          collection.numPosts = result.post_count || 0;
          return {
            collection,
            campaignId: result.campaign_id as string
          };
        }
        return null;
      } catch (error) {
        this.log('error', `Failed to get collection #${id} from DB:`, error);
        return null;
      }
    }

    #savePostCollection(post: Post) {
      this.log('debug', `Clear post_collection for post #${post.id}`);
      this.run(`DELETE FROM post_collection WHERE post_id = ?`, [
        post.id
      ]);
      if (!post.collections || post.collections.length === 0) {
        return;
      }
      for (const collection of post.collections) {
        // Normally, collection would have already been saved to DB via
        // downloader logic, but we should still save it one more
        // time just in case. Difference is, we do not overwrite 
        // DB entry if it already exists.
        this.saveCollection(collection, post.campaign, false);
        try {
          this.run(
            `
            INSERT INTO post_collection (
              collection_id,
              campaign_id,
              post_id,
              post_created_at
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              collection.id,
              post.campaign?.id || '-1',
              post.id,
              this.#publishedAtToTime(collection.createdAt)
            ]
          );
        }
        catch (error) {
          this.log('error', `Failed to save post_collection for post #${post.id} -> collection #${collection.id}:`, error);
        }
      }
    }

    getCollectionList(params: GetCollectionListParams): CollectionList {
      const { campaign, search, sortBy, limit, offset } = params;
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;

      const whereClauseParts: string[] = [ 'campaign_id = ?' ];
      const whereValues: (string | number)[] = [ campaignId ];
      if (search) {
        whereClauseParts.push('collection_fts MATCH ?');
        whereValues.push(search);
      }
      const whereClause = whereClauseParts.length > 0 ? 'WHERE ' + whereClauseParts.join(' AND ') : '';

      let orderByClause: string;
      switch (sortBy) {
        case 'a-z':
          orderByClause = 'collection.title ASC';
          break;
        case 'z-a':
          orderByClause = 'collection.title DESC';
          break;
        case 'last_created':
          orderByClause = 'created_at DESC';
          break;
        case 'last_updated':
          orderByClause = 'edited_at DESC';
          break;
        default:
          orderByClause = '';
      }
      if (orderByClause) {
        orderByClause = `ORDER BY ${orderByClause}`;
      }

      let limitOffsetClause = '';
      const limitOffsetValues: number[] = [];
      if (limit !== undefined && offset !== undefined) {
        limitOffsetClause = 'LIMIT ? OFFSET ?';
        limitOffsetValues.push(limit, offset);
      }
      else if (limit !== undefined) {
        limitOffsetClause = 'LIMIT ?';
        limitOffsetValues.push(limit);
      }

      let fromClause: string;
      if (search) {
        fromClause = `
          FROM
            collection_fts
          LEFT JOIN
            collection_fts_source ON collection_fts_source.fts_rowid = collection_fts.rowid
          LEFT JOIN
            collection ON collection.collection_id = collection_fts_source.collection_id
        `;
      } else {
        fromClause = 'FROM collection';
      }

      const rows = this.all(
        `
        SELECT
          details, post_count
        ${fromClause}
        LEFT JOIN
          (SELECT COUNT(post_id) AS post_count, collection_id FROM post_collection GROUP BY collection_id) pcc ON pcc.collection_id = collection.collection_id
        ${whereClause}
        ${orderByClause}
        ${limitOffsetClause}
        `,
        [...whereValues, ...limitOffsetValues]
      );
      const totalResult = this.get(
        `SELECT COUNT(*) AS collection_count ${fromClause} ${whereClause}`,
        [...whereValues]
      );
      const total = totalResult ? (totalResult.collection_count as number) : 0;
      const collections = rows.map((row) => {
        const collection = JSON.parse(row.details) as Collection;
        collection.numPosts = row.post_count || 0;
        return collection;
      });
      return {
        collections,
        total
      };
    }

    checkCollectionExists(id: string) {
      this.log('debug', `Check if collection #${id} exists in DB`);
      try {
        const result = this.get(
          `
          SELECT COUNT(*) as count
          FROM collection
          WHERE
            collection_id = ?
          `,
          [ id ]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if collection #${id} exists in DB:`,
          error
        );
        return false;
      }
    }

    checkPostTagExists(id: string, campaign: Campaign | null) {
      this.log('debug', `Check if tag "${id}" exists in DB`);
      try {
        const result = this.get(
          `
          SELECT COUNT(*) as count
          FROM post_tag
          WHERE
            post_tag_id = ? AND
            campaign_id = ?
          `,
          [ id, campaign?.id || '-1']
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if post_tag "${id}" exists in DB:`,
          error
        );
        return false;
      }
    }

    getPostComments(post: Post | string): Comment[] | null {
      const postId = typeof post === 'string' ? post : post.id;
      this.log('debug', `Get comments for post #${postId}`);
      const result = this.get(
        `SELECT comments FROM post_comments WHERE post_id = ?`,
        [postId]
      );
      return result ? JSON.parse(result.comments) : null;      
    }

    #savePostTags(post: Post) {
      this.log('debug', `Clear post_tag_post for post #${post.id}`);
      this.run(`DELETE FROM post_tag_post WHERE post_id = ?`, [
        post.id
      ]);
      if (!post.tags || post.tags.length === 0) {
        return;
      }
      for (const tag of post.tags) {
        this.savePostTag(tag, post.campaign, false);
        try {
          this.run(
            `
            INSERT INTO post_tag_post (
              post_tag_id,
              campaign_id,
              post_id
            )
            VALUES (?, ?, ?)
            `,
            [
              tag.id,
              post.campaign?.id || '-1',
              post.id
            ]
          );
        }
        catch (error) {
          this.log('error', `Failed to save post_tag_post for post #${post.id} -> post_tag "${tag.id}":`, error);
        }
      }
    }

    getPostTagList(params: GetPostTagListParams): PostTagList {
      const { campaign } = params;
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;

      const whereClauseParts: string[] = [ 'campaign_id = ?' ];
      const whereValues: (string | number)[] = [ campaignId ];     
      const whereClause = `WHERE ${whereClauseParts.join(' AND ')}`;
      const orderByClause = 'ORDER BY post_tag.value ASC';
      const fromClause = 'FROM post_tag';

      const rows = this.all(
        `
        SELECT
          details
        ${fromClause}
        ${whereClause}
        ${orderByClause}
        `,
        [...whereValues]
      );
      const totalResult = this.get(
        `SELECT COUNT(*) AS tag_count ${fromClause} ${whereClause}`,
        [...whereValues]
      );
      const total = totalResult ? (totalResult.tag_count as number) : 0;
      const tags = rows.map((row) => {
        return JSON.parse(row.details) as PostTag;
      });
      return {
        tags,
        total
      };
    }
  };
}
