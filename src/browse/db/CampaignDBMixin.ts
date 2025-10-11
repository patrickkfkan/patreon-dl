import { type Reward } from '../../entities/Reward.js';
import { type Campaign } from '../../entities/Campaign.js';
import { type UserDBConstructor } from './UserDBMixin.js';
import { type CampaignList, type CampaignWithCounts, type GetCampaignListParams, type GetCampaignParams } from '../types/Campaign.js';

export type CampaignDBConstructor = new (
  ...args: any[]
) => InstanceType<ReturnType<typeof CampaignDBMixin<UserDBConstructor>>>;

const NULL_CAMPAIGN: Campaign = {
  type: 'campaign',
  id: '-1',
  name: '',
  createdAt: null,
  publishedAt: null,
  avatarImage: {
    type: 'image',
    id: '-1',
    filename: 'avatar',
    createdAt: null,
    mimeType: null,
    downloadURL: null,
    imageType: 'default',
    imageURLs: {
      default: null,
      defaultSmall: null,
      original: null,
      thumbnail: null,
      thumbnailLarge: null,
      thumbnailSmall: null
    },
    thumbnailURL: null
  },
  coverPhoto: {
    type: 'image',
    id: 'campaign:-1:cover',
    filename: 'cover-photo',
    mimeType: null,
    imageType: 'campaignCoverPhoto',
    imageURLs: {
      large: null,
      medium: null,
      small: null,
      xlarge: null,
      xsmall: null
    }
  },
  summary: null,
  url: null,
  currency: null,
  rewards: [],
  creator: null,
  raw: {}
}

export function CampaignDBMixin<TBase extends UserDBConstructor>(Base: TBase) {
  return class CampaignDB extends Base {
    saveCampaign(campaign: Campaign | null, downloadDate: Date, overwriteIfExists = true) {
      if (!campaign) {
        campaign = NULL_CAMPAIGN; 
      }
      this.log('debug', `Save campaign #${campaign.id} (${campaign.name}) to DB`);
      try {
        const campaignExists = this.checkCampaignExists(campaign.id);
        if (campaignExists && !overwriteIfExists) {
          return;
        }

        this.exec('BEGIN TRANSACTION');

        // Save creator
        this.saveUser(campaign.creator);

        this.saveMedia(campaign.avatarImage);
        this.saveMedia(campaign.coverPhoto);

        if (!campaignExists) {
          this.run(
            `
            INSERT INTO campaign (
              campaign_id,
              creator_id,
              campaign_name,
              last_download,
              details
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              campaign.id,
              campaign.creator?.id || '-1',
              campaign.name,
              downloadDate.getTime(),
              JSON.stringify(campaign)
            ]
          );
        } else {
          this.log('debug', `Campaign #${campaign.id} already exists in DB - update record`);
          this.run(`
            UPDATE campaign
            SET
              creator_id = ?,
              campaign_name = ?,
              last_download = ?,
              details = ?
            WHERE campaign_id = ?
            `,
            [
              campaign.creator?.id || '-1',
              campaign.name,
              downloadDate.getTime(),
              JSON.stringify(campaign),
              campaign.id
            ]
          );
        }

        // Save rewards
        this.#saveRewards(campaign);

        this.exec('COMMIT');
      } catch (error) {
        this.log(
          'error',
          `Failed to save campaign #${campaign.id} (${campaign.name}) to DB:`,
          error
        );
        this.exec('ROLLBACK');
      }
    }

    getCampaign(params: GetCampaignParams)
      {
        const { id, vanity, withCounts = false } = params;
        if (id) {
          this.log('debug', `Get campaign by ID "${id}" from DB`);
        }
        else if (vanity) {
          this.log('debug', `Get campaign by vanity "${vanity}" from DB`);
        }
        if (!id && !vanity) {
          throw Error('Invalid params: expecting "id" or "vanity" but got none.')
        }
        if (withCounts) {
          return this.#getCampaignWithCounts(params);
        }
        let result;
        if (id) {
          result = this.get(
            `SELECT details FROM campaign WHERE campaign_id = ?`,
            [params.id]
          );
        }
        else {
          result = this.get(
            `
            SELECT campaign.details
            FROM campaign
              LEFT JOIN user ON user.user_id = campaign.creator_id
            WHERE user.vanity = ?;
            `,
            [params.vanity]
          );
        }
        return result ? JSON.parse(result.details) as Campaign : null;
    }

    #saveRewards(campaign: Campaign) {
      if (campaign.id === NULL_CAMPAIGN.id) {
        this.log('warn', 'Skip save rewards to DB because campaign is null');
        return;
      }
      // Clear existing rewards for campaign
      this.log('debug', `Clear existing rewards in DB for campaign #${campaign.id} before saving current ones`);
      this.run(`DELETE FROM reward WHERE campaign_id = ?`, [
        campaign.id
      ]);
      campaign.rewards.forEach((reward) => this.#doSaveReward(campaign, reward));
    }

    #doSaveReward(campaign: Campaign, reward: Reward) {
      this.log('debug', `Add reward #${reward.id} (${reward.title}) to DB`);
      try {
        if (reward.image) {
          this.saveMedia(reward.image);
        }
        this.run(`
          INSERT INTO reward (
            reward_id,
            campaign_id,
            title,
            details
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          reward.id,
          campaign.id,
          reward.title,
          JSON.stringify(reward)
        ]);
      }
      catch (error) {
        this.log(
          'error',
          `Failed to save reward #${reward.id} (${reward.title}) to DB:`,
          error
        );
        throw error;
      }
    }

    getCampaignList(params: GetCampaignListParams): CampaignList {
      const { sortBy, limit, offset } = params;
      this.log('debug', 'Get campaigns from DB:', params);
      let orderByClause: string;
      switch (sortBy) {
        case 'a-z':
          orderByClause = 'campaign_name ASC';
          break;
        case 'z-a':
          orderByClause = 'campaign_name DESC';
          break;
        case 'most_content':
          orderByClause = 'content_count DESC';
          break;
        case 'most_media':
          orderByClause = 'media_count DESC';
          break;
        case 'last_downloaded':
          orderByClause = 'last_download DESC';
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
      const postCountSelect = `
        SELECT
          COUNT(*) AS post_count,
          campaign_id
        FROM content
        WHERE content_type = 'post' GROUP BY campaign_id
      `;
      const productCountSelect = `
        SELECT
          COUNT(*) AS product_count,
          campaign_id
        FROM content
        WHERE content_type = 'product' GROUP BY campaign_id
      `;
      const mediaCountSelect = this.getMediaListSQL({
        select: 'COUNT(content_media.media_id) AS media_count, content_media.campaign_id',
        groupBy: 'content_media.campaign_id'
      });
      try {
        const rows = this.all(
          `
          SELECT
            details,
            IFNULL(post_count, 0) post_count,
            IFNULL(product_count, 0) product_count,
            IFNULL(media_count, 0) media_count,
            COALESCE(post_count, 0) + COALESCE(product_count, 0) content_count
          FROM campaign
            LEFT JOIN (${postCountSelect}) postc ON postc.campaign_id = campaign.campaign_id
            LEFT JOIN (${productCountSelect}) productc ON productc.campaign_id = campaign.campaign_id 
            LEFT JOIN (${mediaCountSelect}) mc ON mc.campaign_id = campaign.campaign_id 
          ${orderByClause}
          ${limitOffsetClause}
          `,
          [...limitOffsetValues]
        );
        const campaigns = rows.map((row) => ({
          ...JSON.parse(row.details) as Campaign,
          postCount: (row.post_count || 0) as number,
          productCount: (row.product_count || 0) as number,
          mediaCount: (row.media_count || 0) as number
        }));
        const totalResult = this.get(
          `SELECT COUNT(*) AS campaign_count FROM campaign`
        );
        const total = totalResult ? (totalResult.campaign_count as number) : 0;
        return {
          campaigns,
          total
        };
      } catch (error) {
        const _error = Error(`Failed to get campaigns from DB:`, {
          cause: error
        });
        this.log('error', _error);
        throw _error;
      }
    }

    #getCampaignWithCounts(params: GetCampaignParams): CampaignWithCounts | null {
      const { id, vanity } = params;
      const joinUser = vanity ? `LEFT JOIN user ON user.user_id = campaign.creator_id` : ''
      const whereClause = vanity ? `WHERE user.vanity = ?` : `WHERE campaign.campaign_id = ?`;
      const whereValues = vanity ? [ vanity ] : [ id ];
      const row = this.get(
        `
        SELECT
          campaign.details,
          IFNULL(media_count, 0) AS media_count,
          IFNULL(post_count, 0) AS post_count,
          IFNULL(product_count, 0) AS product_count
        FROM
          campaign
          ${joinUser}
          LEFT JOIN (SELECT COUNT(content_id) AS post_count, campaign_id FROM content WHERE content_type = 'post' GROUP BY campaign_id) postc ON postc.campaign_id = campaign.campaign_id
          LEFT JOIN (SELECT COUNT(content_id) AS product_count, campaign_id FROM content WHERE content_type = 'product' GROUP BY campaign_id) productc ON productc.campaign_id = campaign.campaign_id
          LEFT JOIN (SELECT COUNT(media_id) AS media_count, campaign_id FROM content_media GROUP BY campaign_id) mc ON mc.campaign_id = campaign.campaign_id
        ${whereClause}
        `,
        [...whereValues]
      );
      return row ? {
        ...JSON.parse(row.details) as Campaign,
        postCount: (row.post_count || 0) as number,
        productCount: (row.product_count || 0) as number,
        mediaCount: (row.media_count || 0) as number
      }
      : null;
    }

    checkCampaignExists(id: string) {
      this.log('debug', `Check if campaign #${id} exists in DB`);
      try {
        const result = this.get(
          `SELECT COUNT(*) as count FROM campaign WHERE campaign_id = ?`,
          [id]
        );
        return result.count > 0;
      } catch (error) {
        this.log(
          'error',
          `Failed to check if campaign #${id} exists in DB:`,
          error
        );
        return false;
      }
    }
  };
}
