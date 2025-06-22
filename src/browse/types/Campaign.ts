import { type Campaign } from "../../entities/index.js";

export type CampaignListSortBy =
  'a-z' |
  'z-a' |
  'most_content' |
  'most_media' |
  'last_downloaded';

export type GetCampaignParams = {
  id: string;
  vanity?: never;
  withCounts?: boolean;
} | {
  id?: never;
  vanity: string;
  withCounts?: boolean;
}

export interface GetCampaignListParams {
  sortBy?: CampaignListSortBy;
  limit?: number;
  offset?: number;
}

export interface CampaignList {
  campaigns: (Campaign & {
    postCount: number;
    productCount: number;
    mediaCount: number;
  })[];
  total: number;
}

export interface CampaignWithCounts extends Campaign {
  postCount: number;
  productCount: number;
  mediaCount: number;
}
