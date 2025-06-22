import { type Downloadable } from './Downloadable.js';
import { type CampaignCoverPhotoMediaItem, type DefaultImageMediaItem } from './MediaItem.js';
import { type Reward } from './Reward.js';
import { type User } from './User.js';

export interface Campaign {
  type: 'campaign';
  id: string;
  name: string;
  createdAt: string | null;
  publishedAt: string | null;
  avatarImage: Downloadable<DefaultImageMediaItem>;
  coverPhoto: Downloadable<CampaignCoverPhotoMediaItem>;
  summary: string | null;
  url: string | null;
  currency: string | null;
  rewards: Reward[];
  creator: User | null;
  raw: object;
}
