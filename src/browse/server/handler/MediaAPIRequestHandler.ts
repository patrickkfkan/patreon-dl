import { type Request, type Response } from 'express';
import { type Logger } from '../../../utils/logging';
import { type APIInstance } from '../../api';
import Basehandler from './BaseHandler.js';
import { getYearMonthString } from '../../../utils/Misc.js';
import { type ContentType } from '../../types/Content.js';
import { type MediaListSortBy } from '../../types/Media.js';

const DEFAULT_ITEMS_PER_PAGE = 20;

export default class MediaAPIRequestHandler extends Basehandler {
  name = 'MediaAPIRequestHandler';

  #api: APIInstance;

  constructor(api: APIInstance, logger?: Logger | null) {
    super(logger);
    this.#api = api;
  }

  async handleListRequest(req: Request, res: Response, campaignId?: string) {
    const { limit, offset } = this.getPaginationParams(req, DEFAULT_ITEMS_PER_PAGE);
    const {
      tier_ids,
      date_published,
      source_type
    } = req.query;
    const tiers = tier_ids ? (tier_ids as string).split(',') : undefined;
    if (tiers && tiers.length > 0) {
      if (!campaignId) {
        throw Error('Invalid params: "tier_ids" must be used with "campaign_id"');
      }
      if (source_type !== 'post') {
        throw Error('Invalid params: "tier_ids" is only applicable for posts');
      }
    }
    const sourceType = req.query['source_type'] ? this.getQueryParamValue<ContentType>(
      req,
      'source_type',
      ['post', 'product']
    ) : undefined;
    const isViewable = req.query['is_viewable'] ? this.getQueryParamValue<'true' | 'false'>(
      req,
      'is_viewable',
      ['true', 'false']
    ) === 'true' ? true : false : undefined;
    const sortBy = this.getQueryParamValue<MediaListSortBy>(
      req,
      'sort_by',
      ['latest', 'oldest'],
      'latest'
    );
    const datePublished = date_published === 'this_month' ? getYearMonthString() : date_published as string | undefined;
    switch (source_type) {
      case 'post':
        res.json(await this.#api.getMediaList({
          campaign: campaignId,
          sourceType,
          isViewable,
          datePublished,
          tiers,
          sortBy,
          limit,
          offset
        }));
        break;
      default:
        res.json(await this.#api.getMediaList({
          campaign: campaignId,
          sourceType,
          isViewable,
          datePublished,
          sortBy,
          limit,
          offset
        }));
        break;
    }
  }

  async handleFilterOptionsRequest(_req: Request, res: Response, campaignId: string) {
    res.json(await this.#api.getMediaFilterData(campaignId));
  }
}