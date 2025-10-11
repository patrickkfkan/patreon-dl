import { type Request, type Response } from 'express';
import { type Logger } from '../../../utils/logging';
import { type APIInstance } from '../../api';
import Basehandler from './BaseHandler.js';
import { type CampaignListSortBy } from '../../types/Campaign.js';

const DEFAULT_ITEMS_PER_PAGE = 20;

export default class CampaignAPIRequestHandler extends Basehandler {
  name = 'CampaignAPIRequestHandler';

  #api: APIInstance;

  constructor(api: APIInstance, logger?: Logger | null) {
    super(logger);
    this.#api = api;
  }

  handleListRequest(req: Request, res: Response) {
    const { limit, offset } = this.getPaginationParams(req, DEFAULT_ITEMS_PER_PAGE);
    const sortBy = this.getQueryParamValue<CampaignListSortBy>(
      req,
      'sort_by',
      ['a-z', 'z-a', 'most_content', 'most_media', 'last_downloaded'],
      'a-z'
    );
    const list = this.#api.getCampaignList({
      sortBy,
      limit,
      offset
    });
    res.json(list);
  }

  handleGetRequest(req: Request, res: Response, id: string) {
    const withCounts = req.query['with_counts'] ? this.getQueryParamValue<'true' | 'false'>(
      req,
      'with_counts',
      ['true', 'false']
    ) === 'true' ? true : false : undefined;
    res.json(this.#api.getCampaign({id, withCounts}));
  }
}