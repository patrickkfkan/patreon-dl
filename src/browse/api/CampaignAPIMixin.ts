import { type APIConstructor } from ".";
import { type Campaign } from "../../entities/index.js";
import { type CampaignList, type CampaignListSortBy, type CampaignWithCounts, type GetCampaignListParams, type GetCampaignParams } from "../types/Campaign.js";


const DEFAULT_CAMPAIGN_LIST_SIZE = 10;
const DEFAULT_CAMPAIGN_LIST_SORT_BY: CampaignListSortBy = 'a-z';


export function CampaignAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class CampaignAPI extends Base {
    getCampaignList(params: GetCampaignListParams): Promise<CampaignList> {
      const { sortBy = DEFAULT_CAMPAIGN_LIST_SORT_BY, limit = DEFAULT_CAMPAIGN_LIST_SIZE, offset = 0 } = params;
      return this.db.getCampaignList({
        sortBy,
        limit,
        offset
      });
    }

    getCampaign(params: GetCampaignParams & { withCounts: true }): Promise<CampaignWithCounts | null>;
    getCampaign(params: GetCampaignParams & { withCounts?: false }): Promise<Campaign | null>;
    getCampaign(params: GetCampaignParams): Promise<Campaign | CampaignWithCounts | null>;
    getCampaign(params: GetCampaignParams) {
      return this.db.getCampaign(params);
    }
  }
}