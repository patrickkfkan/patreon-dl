import { type APIConstructor } from ".";
import { type Campaign } from "../../entities/index.js";
import { type CampaignList, type CampaignListSortBy, type CampaignWithCounts, type GetCampaignListParams, type GetCampaignParams } from "../types/Campaign.js";


const DEFAULT_CAMPAIGN_LIST_SIZE = 10;
const DEFAULT_CAMPAIGN_LIST_SORT_BY: CampaignListSortBy = 'a-z';


export function CampaignAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class CampaignAPI extends Base {
    getCampaignList(params: GetCampaignListParams): CampaignList {
      const { sortBy = DEFAULT_CAMPAIGN_LIST_SORT_BY, limit = DEFAULT_CAMPAIGN_LIST_SIZE, offset = 0 } = params;
      const list = this.db.getCampaignList({
        sortBy,
        limit,
        offset
      });
      for (const campaign of list.campaigns) {
        this.#sanitizeCampaign(campaign);
      }
      return list;
    }

    getCampaign(params: GetCampaignParams & { withCounts: true }): CampaignWithCounts | null;
    getCampaign(params: GetCampaignParams & { withCounts?: false }): Campaign | null;
    getCampaign(params: GetCampaignParams): Campaign | CampaignWithCounts | null;
    getCampaign(params: GetCampaignParams) {
      const campaign = this.db.getCampaign(params);
      if (campaign) {
        this.#sanitizeCampaign(campaign);
      }
      return campaign;
    }

    #sanitizeCampaign(campaign: Campaign) {
      if (campaign.summary) {
        campaign.summary = this.sanitizeHTML(campaign.summary);
      }
      for (const reward of campaign.rewards) {
        if (reward.description) {
          reward.description = this.sanitizeHTML(reward.description);
        }
      }
    }
  }
}