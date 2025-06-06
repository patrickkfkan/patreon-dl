import { type Campaign } from './Campaign.js';
import { type Collection } from './Collection.js';
import { type Downloadable } from './Downloadable.js';
import { type PostCoverImageMediaItem, type PostThumbnailMediaItem } from './MediaItem.js';
import { type Tier } from './Reward.js';

export type PostCollection = Collection<Post>;

export interface Post {
  type: 'post';
  id: string;
  /**
   * @privateRemarks
   *
   * `data.attibutes.post_type`
   *
   * Known types:
   * - image_file
   * - video_external_file
   * - audio_file
   * - text_only
   * - poll
   * - link: only embedded link info is saved. Link is not followed / downloaded.
   * - video_embed - only embedded video info is saved. Video itself is not downloaded.
   * - podcast
   */
  postType: string;
  isViewable: boolean;
  url: string | null;
  title: string | null;
  content: string | null;
  teaserText: string | null;
  publishedAt: string | null;
  editedAt: string | null;
  commentCount: number;
  coverImage: PostCoverImageMediaItem | null;
  thumbnail: PostThumbnailMediaItem | null;
  tiers: Tier[];

  /**
   * @privateRemarks
   * `data.attibutes.embed`
   */
  embed: PostEmbed | null;

  /**
   * @privateRemarks
   * `data.relationships.attachments`
   */
  attachments: Downloadable[];

  /**
   * @privateRemarks
   * `data.relationships.audio`
   */
  audio: Downloadable | null;

  /**
   * @privateRemarks
   * `data.relationships.audio_prevew`
   */
  audioPreview: Downloadable | null;

  /**
   * @privateRemarks
   * `data.relationships.images`
   */
  images: Downloadable[];

  /**
   * @privateRemarks
   * Not included in `data.relationships`
   * Converted from `data.attributes.video_preview`
   */
  videoPreview: Downloadable | null;

  /**
   * @privateRemarks
   * Not included in `data.relationships`
   * Converted from `data.attributes.post_file` with
   * `data.attributes.post_type` matching 'video_external_file' / 'podcast'
   */
  video: Downloadable | null;

  campaign: Campaign | null;

  raw: object;
}

export interface PostEmbed {
  id: `${string}-embed`;
  postId: string;
  postURL: string | null;
  type: 'videoEmbed' | 'linkEmbed' | 'unknownEmbed';
  description: string | null;
  html: string | null;
  provider: string | null;
  providerURL: string | null;
  subject: string | null;
  url: string | null;
}

export type YouTubePostEmbed = PostEmbed & { provider: 'YouTube' }
