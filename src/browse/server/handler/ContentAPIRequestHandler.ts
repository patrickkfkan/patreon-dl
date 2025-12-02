import { type Request, type Response } from 'express';
import { type Logger } from '../../../utils/logging';
import { type APIInstance } from '../../api';
import Basehandler from './BaseHandler.js';
import { getYearMonthString } from '../../../utils/Misc.js';
import { type GetContentContext, type ContentListSortBy, type ContentType, type CollectionListSortBy } from '../../types/Content.js';

const DEFAULT_ITEMS_PER_PAGE = 20;

export default class ContentAPIRequestHandler extends Basehandler {
  name = 'ContentAPIRequestHandler';

  #api: APIInstance;

  constructor(api: APIInstance, logger?: Logger | null) {
    super(logger);
    this.#api = api;
  }

  #getContext(req: Request, campaignId?: string, contentType?: ContentType) {
    const {
      tier_ids,
      collection_id,
      post_types,
      date_published,
      search,
      tag_id
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
    return {
      campaign: campaignId,
      type: contentType,
      postTypes,
      isViewable,
      datePublished,
      tiers,
      collection: collection_id as string | undefined,
      search: search as string | undefined,
      tag: tag_id as string | undefined,
      sortBy
    };
  }

  handleListRequest(req: Request, res: Response, campaignId?: string, contentType?: ContentType) {
    const { limit, offset } = this.getPaginationParams(req, DEFAULT_ITEMS_PER_PAGE);
    const {
      campaign,
      type,
      postTypes,
      isViewable,
      datePublished,
      tiers,
      collection,
      search,
      tag,
      sortBy
    } = this.#getContext(req, campaignId, contentType);
    
    switch (contentType) {
      case 'post':
        res.json(this.#api.getContentList({
          campaign,
          type,
          postTypes,
          isViewable,
          datePublished,
          tiers,
          collection,
          search,
          tag,
          sortBy,
          limit,
          offset
        }));
        break;
      default:
        res.json(this.#api.getContentList({
          campaign,
          type,
          isViewable,
          datePublished,
          search,
          sortBy,
          limit,
          offset
        }));
        break;
    }
  }

  handleCollectionRequest(_req: Request, res: Response, collectionId: string) {
    const result = this.#api.getCollection(collectionId);
    if (!result) {
      throw Error('Data not found');
    }
    res.json(result);
  }

  handleCollectionListRequest(req: Request, res: Response, campaignId: string) {
    const { limit, offset } = this.getPaginationParams(req, DEFAULT_ITEMS_PER_PAGE);
    const sortBy = this.getQueryParamValue<CollectionListSortBy>(
      req,
      'sort_by',
      ['a-z', 'z-a', 'last_created', 'last_updated'],
      'last_updated'
    );
    const list = this.#api.getCollectionList({
      campaign: campaignId,
      search: req.query.search as string | undefined,
      sortBy,
      limit,
      offset
    });
    res.json(list);
  }

  handlePostTagListRequest(_req: Request, res: Response, campaignId: string) {
    const list = this.#api.getPostTagList({
      campaign: campaignId,
    });
    res.json(list);
  }

  handleGetRequest(req: Request, res: Response, contentType: ContentType, id: string) {
    switch (contentType) {
      case 'post': {
        const post = this.#api.getPost(id);
        const context = this.#getContext(req, post?.campaign?.id, contentType) as GetContentContext<'post'>;
        const { previous = null, next = null } = post ? this.#api.getPreviousNextContent(post, context) : {};
        res.json({
          post,
          previous,
          next
        });

        break;
      }
      case 'product':
        res.json(this.#api.getProduct(id));
        break;
    }
  }

  handleFilterOptionsRequest(_req: Request, res: Response, campaignId: string, contentType: ContentType) {
    switch (contentType) {
      case 'post':
        res.json(this.#api.getPostFilterData(campaignId));
        break;
      case 'product':
        res.json(this.#api.getProductFilterData(campaignId));
        break;
    }
  }
}