import { type Comment, type Downloadable, type Post, type Product, type Tier, type Campaign } from '../../entities';
import { getYearMonthString, type KeysOfValue } from '../../utils/Misc.js';
import { type GetContentContext, type GetPreviousNextContentResult, type ContentList, type ContentType, type GetContentListParams, type PostWithComments, type ContentListSortBy } from '../types/Content.js';
import { type CampaignDBConstructor } from './CampaignDBMixin.js';

export function ContentDBMixin<TBase extends CampaignDBConstructor>(Base: TBase) {
  return class ContentDB extends Base {
    async saveContent(content: Post | Product) {
      const title = content.type === 'post' ? content.title : content.name;
      this.log('debug', `Save ${content.type} #${content.id} (${title}) to DB`);
      try {
        // Normally, campaign would have already been saved to DB via
        // downloader logic, but we should still save it one more
        // time just in case. Difference is, we do not overwrite 
        // DB entry if it already exists.
        await this.saveCampaign(content.campaign, new Date(), false);

        const contentExists = await this.checkContentExists(content.id, content.type, content.campaign);
        await this.exec('BEGIN TRANSACTION');

        if (!contentExists) {
          this.log('debug', `INSERT post "${title}" (${content.id})`);
          await this.run(
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
              content.type === 'post' ? content.postType : null,
              (content.type === 'post' ? content.isViewable : content.isAccessible) ? 1 : 0,
              this.#publishedAtToTime(content.publishedAt),
              JSON.stringify(content)
            ]
          );
        } else {
          this.log('debug', `${content.type} #${content.id} already exists in DB - update record`);
          await this.run(`
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
              content.type === 'post' ? content.postType : null,
              (content.type === 'post' ? content.isViewable : content.isAccessible) ? 1 : 0,
              this.#publishedAtToTime(content.publishedAt),
              JSON.stringify(content),
              content.id
            ]
          );
        }

        // Save content media
        await this.#saveContentMedia(content);

        // Save tiers
        if (content.type === 'post') {
          await this.#savePostTiers(content);
        }

        await this.exec('COMMIT');
      } catch (error) {
        this.log(
          'error',
          `Failed to save content "${title}" (${content.id}) to DB:`,
          error
        );
        await this.exec('ROLLBACK');
      }
    }

    async #saveContentMedia(
      content: Post | Product
    ) {
      this.log('debug', `Save media for ${content.type} #${content.id} to DB`);
      switch (content.type) {
        case 'post':
          await this.#savepostMedia(content);
          break;
        case 'product':
          await this.#saveProductMedia(content);
          break;
      }
    }

    async #savepostMedia(post: Post) {
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
        await this.saveMedia(post.coverImage);
      }
      if (post.thumbnail) {
        await this.saveMedia(post.thumbnail);
      }
      for (const prop of mediaProps) {
        if (post[prop]) {
          const data = post[prop];
          const downloadables = (Array.isArray(data) ? data : [data])
            .filter((data) => data !== undefined);
          await Promise.all(
            downloadables.map((dl, index) => this.#doSaveContentMedia(
              post,
              dl,
              index,
              prop === 'audioPreview'||
              prop === 'videoPreview' ||
              (prop === 'images' && !post.isViewable)
            ))
          );
        }
      }
    }

    async #saveProductMedia(product: Product) {
      const mediaProps: KeysOfValue<Product, Downloadable[]>[] = [
        'contentMedia',
        'previewMedia'
      ];
      for (const prop of mediaProps) {
        if (product[prop]) {
          const data = product[prop];
          const downloadables = (Array.isArray(data) ? data : [data])
            .filter((data) => data !== undefined);
          await Promise.all(
            downloadables.map((dl, index) => this.#doSaveContentMedia(
              product,
              dl,
              index,
              prop === 'previewMedia'
            ))
          );
        }
      }
    }

    async #doSaveContentMedia(
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
      await this.saveMedia(media);
      try {
        const contentMediaExists = await this.checkContentMediaExists(content, media);
        if (!contentMediaExists) {
          await this.run(
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
          await this.run(
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

    async #savePostTiers(post: Post) {
      this.log('debug', `Save tiers for post #${post.id} to DB`);
      // Clear existing tiers for post
      this.log('debug', `Clear existing tiers in DB for post #${post.id} before saving current ones`);
      await this.run(`DELETE FROM post_tier WHERE post_id = ?`, [
        post.id
      ]);
      await Promise.all(post.tiers.map((tier) => this.#doSaveTier(post, tier)));
    }

    async #doSaveTier(post: Post, tier: Tier) {
      this.log('debug', `Add post tier #${tier.id} (${tier.title}) to DB`);
      await this.run(`
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

    async savePostComments(post: Post, comments: Comment[]) {
      try {
        this.log('debug', `Save comments for post #${post.id}`);
        const commentsExist = await this.checkPostCommentsExist(post);
        if (!commentsExist) {
          await this.run(
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
          await this.run(
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

    async checkPostCommentsExist(post: Post): Promise<boolean> {
      try {
        const result = await this.get(
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

    async getContent(id: string, contentType: 'post'): Promise<PostWithComments | null>;
    async getContent(id: string, contentType: 'product'): Promise<Product | null>;
    async getContent(id: string, contentType: ContentType) {
      this.log('debug', `Get ${contentType} #${id} from DB`);
      const result = await this.get(
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

    async getPreviousNextContent<T extends ContentType>(
      content: Post | Product,
      context: GetContentContext<T>
    ): Promise<GetPreviousNextContentResult<T>> {
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
        case 'oldest': {
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
      const previous = (await this.getContentList(
        {
          ...context,
          sortBy: previousSortBy,
          limit: 1, offset: 0
        },
        {
          whereClauses: [previousWhere],
          whereValues
        },
        false
      )).items[0] || null;
      const next = (await this.getContentList(
        {
          ...context,
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

    async getContentList<T extends ContentType>(
      params: GetContentListParams<T>,
      db?: { whereClauses: string[]; whereValues: any[]; },
      includeTotal = true
    ): Promise<ContentList<T>> {
      const { campaign, type: contentType, isViewable, datePublished, sortBy, limit, offset } = params;
      const { whereClauses: extraWhereClauses = [], whereValues: extraWhereValues = [] } = db || {};
      const campaignId = !campaign ? null : (typeof campaign === 'string' ? campaign : campaign.id);
      this.log('debug', `Get ${contentType}s from DB:`, {
        campaign: campaignId,
        isViewable,
        datePublished,
        sortBy,
        limit,
        offset
      });
      const tiers = params.type === 'post' ? (params as GetContentListParams<'post'>).tiers : null;
      const contentSubtypes = params.type === 'post' ? (params as GetContentListParams<'post'>).postTypes : null;
      if (tiers && tiers.length > 0 && !campaign) {
        throw Error('Invalid params: "tiers" must be used with "campaign"');
      }
      const join = tiers && tiers.length > 0 ? 'LEFT JOIN post_tier ON post_tier.post_id = content.content_id' : '';
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
      whereClauseParts.push(...extraWhereClauses);
      const whereClause = whereClauseParts.length > 0 ? 'WHERE ' + whereClauseParts.join(' AND ') : '';
      const whereValues = [
        ...whereEquals.map(({value}) => value),
        ...whereIns.reduce<(string | number)[]>((result, {values}) => {
          result.push(...values);
          return result;
        }, []),
        ...extraWhereValues
      ];
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
      const rows = await this.all(
        `
        SELECT DISTINCT
          details,
          IFNULL(post_comments.comment_count, 0) AS comment_count,
          comments
        FROM
          content
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
      const totalResult = includeTotal ? await this.get(
          `SELECT COUNT(*) AS content_count FROM content ${join} ${whereClause}`,
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

    async getContentCountByDate(
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
      const rows = await this.all(
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

    async getPostCountByType(campaign: Campaign | string) {
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
      this.log('debug', `Get post count by type for campaign #${campaignId}`);
      const rows = await this.all(
        `
        SELECT
          COUNT(content_id) AS post_count, content_subtype AS post_type
        FROM
          content
        WHERE
          content_type = "post" AND campaign_id = ?
        GROUP BY content_subtype 
        `,
        [campaignId]
      );
      return rows.map((row) => ({
        postType: row.post_type as string,
        count: row.post_count as number
      }));
    }

    async getPostCountByTier(campaign: Campaign | string) {
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
      this.log('debug', `Get post count by tier for campaign #${campaignId}`);
      const rows = await this.all(
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

    async checkContentExists(id: string, contentType: ContentType, campaign: Campaign | null): Promise<boolean> {
      this.log('debug', `Check if ${contentType} #${id} exists in DB`);
      try {
        const result = await this.get(
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

    async getPostComments(post: Post | string): Promise<Comment[] | null> {
      const postId = typeof post === 'string' ? post : post.id;
      this.log('debug', `Get comments for post #${postId}`);
      const result = await this.get(
        `SELECT comments FROM post_comments WHERE post_id = ?`,
        [postId]
      );
      return result ? JSON.parse(result.comments) : null;      
    }
  };
}
