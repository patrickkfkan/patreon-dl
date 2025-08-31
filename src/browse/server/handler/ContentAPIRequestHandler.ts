import { type Request, type Response } from 'express';
import { type Logger } from '../../../utils/logging';
import { type APIInstance } from '../../api';
import Basehandler from './BaseHandler.js';
import { getYearMonthString } from '../../../utils/Misc.js';
import { type ContentListSortBy, type ContentType } from '../../types/Content.js';
import { Post } from '../../../entities';
import { load as cheerioLoad } from 'cheerio';

const DEFAULT_ITEMS_PER_PAGE = 20;

export default class ContentAPIRequestHandler extends Basehandler {
  name = 'ContentAPIRequestHandler';

  #api: APIInstance;

  constructor(api: APIInstance, logger?: Logger | null) {
    super(logger);
    this.#api = api;
  }

  async handleListRequest(req: Request, res: Response, campaignId?: string, contentType?: ContentType) {
    const { limit, offset } = this.getPaginationParams(req, DEFAULT_ITEMS_PER_PAGE);
    const {
      tier_ids,
      post_types,
      date_published
    } = req.query;
    const postTypes = post_types ? (post_types as string).split(',') : undefined;
    const tiers = tier_ids ? (tier_ids as string).split(',') : undefined;
    if (tiers && tiers.length > 0) {
      if (!campaignId) {
        throw Error('Invalid params: "tier_ids" must be used with "campaign_id"');
      }
      if (contentType !== 'post') {
        throw Error('Invalid params: "tier_ids" is only applicable for posts');
      }
    }
    const isViewable = req.query['is_viewable'] ? this.getQueryParamValue<'true' | 'false'>(
      req,
      'is_viewable',
      ['true', 'false']
    ) === 'true' ? true : false : undefined;
    const sortBy = this.getQueryParamValue<ContentListSortBy>(
      req,
      'sort_by',
      ['a-z', 'z-a', 'latest', 'oldest'],
      'a-z'
    );
    const datePublished = date_published === 'this_month' ? getYearMonthString() : date_published as string | undefined;
    switch (contentType) {
      case 'post':
        res.json(await this.#api.getContentList({
          campaign: campaignId,
          type: contentType,
          postTypes,
          isViewable,
          datePublished,
          tiers,
          sortBy,
          limit,
          offset
        }));
        break;
      default:
        res.json(await this.#api.getContentList({
          campaign: campaignId,
          type: contentType,
          isViewable,
          datePublished,
          sortBy,
          limit,
          offset
        }));
        break;
    }
  }

  async handleGetRequest(_req: Request, res: Response, contentType: ContentType, id: string) {
    switch (contentType) {
      case 'post':
        res.json(await this.#api.getPost(id));
        break;
      case 'product':
        res.json(await this.#api.getProduct(id));
        break;
    }
  }

  async handleFilterOptionsRequest(_req: Request, res: Response, campaignId: string, contentType: ContentType) {
    switch (contentType) {
      case 'post':
        res.json(await this.#api.getPostFilterData(campaignId));
        break;
      case 'product':
        res.json(await this.#api.getProductFilterData(campaignId));
        break;
    }
  }
}