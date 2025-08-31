import { type APIConstructor } from ".";
import { type Campaign } from "../../entities/index.js";
import { type CampaignList, type CampaignListSortBy, type CampaignWithCounts, type GetCampaignListParams, type GetCampaignParams } from "../types/Campaign.js";


const DEFAULT_CAMPAIGN_LIST_SIZE = 10;
const DEFAULT_CAMPAIGN_LIST_SORT_BY: CampaignListSortBy = 'a-z';


export function CampaignAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class CampaignAPI extends Base {
    async getCampaignList(params: GetCampaignListParams): Promise<CampaignList> {
      const { sortBy = DEFAULT_CAMPAIGN_LIST_SORT_BY, limit = DEFAULT_CAMPAIGN_LIST_SIZE, offset = 0 } = params;
      const list = await this.db.getCampaignList({
        sortBy,
        limit,
        offset
      });
      for (const campaign of list.campaigns) {
        this.#sanitizeCampaign(campaign);
      }
      return list;
    }

    async getCampaign(params: GetCampaignParams & { withCounts: true }): Promise<CampaignWithCounts | null>;
    async getCampaign(params: GetCampaignParams & { withCounts?: false }): Promise<Campaign | null>;
    async getCampaign(params: GetCampaignParams): Promise<Campaign | CampaignWithCounts | null>;
    async getCampaign(params: GetCampaignParams) {
      const campaign = await this.db.getCampaign(params);
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