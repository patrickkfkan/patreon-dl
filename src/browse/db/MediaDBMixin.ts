import { type DBConstructor } from '.';
import { type Downloadable, type Downloaded, type Post, type Campaign, type Product } from '../../entities';
import { PostType } from '../../entities/Post.js';
import { getYearMonthString } from '../../utils/Misc.js';
import { type ContentType } from '../types/Content.js';
import { type GetMediaListParams, type MediaList, type MediaListItem } from '../types/Media.js';

export type MediaDBConstructor = new (
  ...args: any[]
) => InstanceType<ReturnType<typeof MediaDBMixin<DBConstructor>>>;

type DBMediaType = 'image' | 'video' | 'audio' | 'other';

export function MediaDBMixin<TBase extends DBConstructor>(Base: TBase) {
  return class MediaDB extends Base {
    async saveMedia(
      media: Downloadable
    ) {
      if (!media.downloaded || !media.downloaded.path) {
        return;
      }
      let mediaType: DBMediaType;
      const mimeType = media.downloaded.mimeType || '';
      if (mimeType.startsWith('image/')) {
        mediaType = 'image';
      }
      else if (mimeType.startsWith('video/')) {
        mediaType = 'video';
      }
      else if (mimeType.startsWith('audio/')) {
        mediaType = 'audio';
      }
      else {
        mediaType = 'other';
      }
      this.log('debug', `Save media #${media.id} to DB`);
      try {
        const mediaExists = await this.checkMediaExists(media);
        if (!mediaExists) {
          await this.run(
            `
            INSERT INTO media (
              media_id,
              media_type,
              mime_type,
              thumbnail_mime_type,
              download_path,
              thumbnail_download_path,
              thumbnail_width,
              thumbnail_height
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              media.id,
              mediaType,
              media.downloaded.mimeType,
              media.downloaded.thumbnail?.mimeType || null,
              media.downloaded.path,
              media.downloaded.thumbnail?.path || null,
              media.downloaded.thumbnail?.width ?? null,
              media.downloaded.thumbnail?.height ?? null
            ]
          );
        }
        else {
          this.log('debug', `Media #${media.id} already exists in DB - update record`);
          await this.run(
            `
            UPDATE media
            SET
              media_type = ?,
              mime_type = ?,
              thumbnail_mime_type = ?,
              download_path = ?,
              thumbnail_download_path = ?,
              thumbnail_width = ?,
              thumbnail_height = ?
            WHERE
              media_id = ?
            `,
            [
              mediaType,
              media.downloaded.mimeType,
              media.downloaded.thumbnail?.mimeType || null,
              media.downloaded.path,
              media.downloaded.thumbnail?.path || null,
              media.downloaded.thumbnail?.width ?? null,
              media.downloaded.thumbnail?.height ?? null,
              media.id,
            ]
          );
        }
      }
      catch (error) {
        this.log(
          'error',
          `Failed to save media (media_id: ${media.id}) to DB:`,
          error
        );
        throw error;
      }
    }

    async checkMediaExists(media: Downloadable): Promise<boolean> {
      this.log('debug', `Check if media #${media.id} exists in DB`);
      try {
        const result = await this.get(
          `SELECT COUNT(*) as count FROM media WHERE media_id = ?`,
          [ media.id ]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if media #${media.id} exists in DB:`,
          error
        );
        return false;
      }
    }

    async checkContentMediaExists(content: Post | Product, media: Downloadable): Promise<boolean> {
      this.log(
        'debug',
        `Check if content media exists in DB`,
        `(${content.type} ID: ${content.id}, media ID: ${media.id})`,
      );
      try {
        const result = await this.get(
          `
          SELECT COUNT(*) as count
          FROM content_media
          WHERE
            content_id = ? AND
            content_type = ? AND
            media_id = ? AND
            campaign_id = ?
          `,
          [
            content.id,
            content.type,
            media.id,
            content.campaign?.id || '-1'
          ]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if content media exists in DB:`,
          `(${content.type} ID: ${content.id}, media ID: ${media.id})`,
          error
        );
        return false;
      }
    }

    async getMediaByID(id: string): Promise<Downloaded | null> {
      this.log('debug', `Get media #${id} from DB`);
      const result = await this.get(
        `
        SELECT 
          mime_type,
          thumbnail_mime_type,
          download_path,
          thumbnail_download_path,
          thumbnail_width,
          thumbnail_height
        FROM
          media
        WHERE
          media_id = ?
        `,
        [id]
      );
      return result ? {
        mimeType: result.mime_type,
        path: result.download_path,
        thumbnail: {
          mimeType: result.thumbnail_mime_type,
          path: result.thumbnail_download_path,
          width: result.thumbnail_width,
          height: result.thumbnail_height
        }
      } : null;
    }

    async getMediaList<T extends ContentType>(params: GetMediaListParams<T>): Promise<MediaList<T>> {
      const { campaign, sourceType, isViewable, datePublished, sortBy, limit, offset } = params;
      const campaignId = !campaign ? null : (typeof campaign === 'string' ? campaign : campaign.id );
      const tiers = params.sourceType === 'post' ? (params as GetMediaListParams<'post'>).tiers : null;
      const tierIds = tiers && tiers.length > 0 ? tiers.map((tier) => typeof tier === 'string' ? tier : tier.id) : null;
      this.log('debug', 'Get media list from DB:', {
        campaign: campaignId,
        sourceType,
        isViewable,
        tierIds,
        datePublished,
        sortBy,
        limit,
        offset
      });
      if (tierIds && !campaign) {
        throw Error('Invalid params: "tiers" must be used with "campaign"');
      }
      const join = tiers && tiers.length > 0 ? 'LEFT JOIN post_tier ON post_tier.post_id = content.content_id' : '';
      const whereEquals: { column: string; value: string | number; }[] = [];
      if (campaignId) {
        whereEquals.push({ column: 'content.campaign_id', value: campaignId });
      }
      if (sourceType) {
        whereEquals.push({ column: 'content.content_type', value: sourceType });
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
      if (tierIds) {
        whereIns.push({ column: 'tier_id', values: tierIds });
      }
      const whereClauseParts: string[] = [];
      if (whereEquals.length > 0) {
        whereClauseParts.push(...whereEquals.map(({column: field}) => `${field} = ?` ));
      }
      if (whereIns.length > 0) {
        whereClauseParts.push(...whereIns.map((wi) => `${wi.column} IN (${wi.values.map(() => '?').join(', ')})`));
      }
      const whereClause = whereClauseParts.join(' AND ');
      const whereValues = [
        ...whereEquals.map(({value}) => value),
        ...whereIns.reduce<(string | number)[]>((result, {values}) => {
          result.push(...values);
          return result;
        }, [])
      ];
      const orderByParts: string[] = []
      switch (sortBy) {
        case 'latest':
          orderByParts.push('published_at DESC');
          break;
        case 'oldest':
          orderByParts.push('published_at ASC');
          break;
      }
      orderByParts.push('media_index ASC');
      const orderByClause = orderByParts.join(', ');
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
      const sql = this.getMediaListSQL({
        select: `DISTINCT
          media.media_id,
          media.media_type,
          media.mime_type,
          media.thumbnail_width,
          media.thumbnail_height,
          media.thumbnail_download_path,
          content.details`,
        join,
        where: whereClause,
        orderBy: orderByClause,
        limitOffset: limitOffsetClause
      });
      const rows = await this.all(
        sql,
        [ ...whereValues, ...limitOffsetValues ]
      );
      const items = rows.map<MediaListItem<T>>((row) => ({
          id: row.media_id,
          mediaType: row.media_type,
          mimeType: row.mime_type ?? null,
          thumbnail: row.thumbnail_download_path ? {
            path: row.thumbnail_download_path,
            width: row.thumbnail_width || null,
            height: row.thumbnail_height || null
          } : null,
          source: JSON.parse(row.details)
      }));
      const totalSql = this.getMediaListSQL({
        select: 'COUNT(DISTINCT media.media_id) AS media_count',
        join,
        where: whereClause,
      });
      const totalResult = await this.get(totalSql, whereValues);
      const total = totalResult ? (totalResult.media_count as number) : 0;
      return {
        items,
        total
      };
    }

    async getMediaCountByDate(
      groupBy: 'year' | 'month',
      filter?: {
        campaign?: Campaign | string | null,
        date?: Date | null}
    ) {
      const campaign = filter?.campaign || null;
      const campaignId = !campaign ? null : (typeof campaign === 'string' ? campaign : campaign.id);
      this.log('debug', `Get media count by date:`, {
        groupBy,
        filter: !filter ? null : {
          campaign: campaignId,
          date: filter.date
        }
      });
      const date = filter?.date || null;
      const whereClauseParts = [];
      const whereValues: string[] = [];
      if (campaignId) {
        whereClauseParts.push('content_media.campaign_id = ?');
        whereValues.push(campaignId);
      }
      if (date) {
        whereClauseParts.push(`dt = ?`);
        const value = groupBy === 'year' ?
          String(date.getUTCFullYear())
          : getYearMonthString(date);
        whereValues.push(String(value));
      }
      const whereClause = whereClauseParts.join(' AND ');
      const strftimeFormat = groupBy === 'year' ? '%Y' : '%Y-%m'
      const sql = this.getMediaListSQL({
        select: `COUNT(media.media_id) AS media_count, strftime('${strftimeFormat}', datetime(published_at / 1000, 'unixepoch')) AS dt`,
        where: whereClause,
        groupBy: 'dt',
        orderBy: 'dt DESC'
      })
      const rows = await this.all(sql, whereValues);
      return rows.map((row) => ({
        dt: row.dt as string,
        count: row.media_count as number
      }));
    }

    async getMediaCountByContentType(campaign?: Campaign | string | null) {
      const campaignId = typeof campaign === 'string' ? campaign : campaign?.id;
      this.log('debug', `Get media count by content type for campaign #${campaignId}`);
      const whereClauseParts: string[] = [];
      const whereValues: string[] = [];
      if (campaignId) {
        whereClauseParts.push('content_media.campaign_id = ?');
        whereValues.push(campaignId);
      }
      const whereClause = whereClauseParts.join(' AND ');
      const sql = this.getMediaListSQL({
        select: 'COUNT(media.media_id) AS media_count, content.content_type',
        where: whereClause,
        groupBy: 'content.content_type',
        orderBy: 'content.content_type DESC'
      });
      const rows = await this.all(sql, whereValues);
      return rows.map((row) => ({
        contentType: row.content_type as 'post' | 'product',
        count: row.media_count as number
      }));
    }

    async getMediaCountByTier(campaign: Campaign | string) {
      const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
      this.log('debug', `Get media count by tier for campaign #${campaignId}`);
      const sql = this.getMediaListSQL({
        select: 'COUNT(media.media_id) as media_count, tier_id, reward.title',
        join: `LEFT JOIN post_tier ON post_tier.campaign_id = content_media.campaign_id AND post_tier.post_id = content_media.content_id
          RIGHT JOIN reward ON reward.reward_id = post_tier.tier_id AND reward.campaign_id = post_tier.campaign_id`,
        where: `content.content_type = 'post' AND
          post_tier.campaign_id = ?`,
        groupBy: 'post_tier.campaign_id, tier_id'
      })
      const rows = await this.all(sql, [campaignId]);
      return rows.map((row) => ({
        tierId: row.tier_id as string,
        title: row.title as string,
        count: row.media_count as number
      }));
    }

    getMediaListSQL(params: {
      select: string;
      join?: string;
      where?: string;
      groupBy?: string;
      orderBy?: string;
      limitOffset?: string;
    }) {
      const finalJoin = `
        LEFT JOIN content_media ON content_media.media_id = media.media_id
        LEFT JOIN content ON content.content_id = content_media.content_id AND content.campaign_id = content_media.campaign_id
        ${params.join || ''}
      `;
      const finalWhere = `
        WHERE
          content_media.is_preview != content.is_viewable AND
          content.content_id IS NOT NULL AND
          (
            (
              content.content_type = 'product' AND
              (
                media_type IN ('image', 'video', 'audio')
                OR
                mime_type = 'application/pdf'
              )
            )
            OR
            (
              content.content_type = 'post' AND 
              (
                (content.content_subtype IN ('${PostType.Audio}', '${PostType.Podcast}', '${PostType.Link}') AND media_type = 'audio') OR 
                (content.content_subtype IN ('${PostType.Video}', '${PostType.VideoEmbed}', '${PostType.Podcast}', '${PostType.Link}') AND media_type = 'video') OR 
                (content.content_subtype NOT IN ('${PostType.Audio}', '${PostType.Podcast}', '${PostType.Video}', '${PostType.VideoEmbed}', '${PostType.Link}') AND media_type IN ('image', 'video', 'audio'))
              )
            )
          )
          ${params.where ? `AND ${params.where}` : ''}
      `;
      return `
        SELECT ${params.select}
        FROM
          media
        ${finalJoin}
        ${finalWhere}
        ${params.groupBy ? `GROUP BY ${params.groupBy}` : ''}
        ${params.orderBy ? `ORDER BY ${params.orderBy}` : ''}
        ${params.limitOffset || ''}
      `;
    }
  };
}
