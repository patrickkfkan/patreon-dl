import { Campaign } from './Campaign.js';
import { Downloadable } from './Downloadable.js';
import { PostCoverImageMediaItem, PostThumbnailMediaItem } from './MediaItem.js';
import { Tier } from './Reward.js';

export interface PostCollection {
  url: string;
  posts: Post[];
  total: number | null;
  nextURL: string | null;
}

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
   */
  postType: string;
  isViewable: boolean;
  url: string | null;
  title: string | null;
  content: string | null;
  teaserText: string | null;
  publishedAt: string | null;
  editedAt: string | null;
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
   * `data.attributes.post_type` matching 'video_external_file'
   */
  video: Downloadable | null;

  campaign: Campaign | null;

  raw: object;
}

export interface PostEmbed {
  id: `${string}-embed`;
  postId: string;
  type: 'videoEmbed' | 'linkEmbed' | 'unknownEmbed';
  description: string | null;
  html: string | null;
  provider: string | null;
  providerURL: string | null;
  subject: string | null;
  url: string | null;
}

export type YouTubePostEmbed = PostEmbed & { type: 'videoEmbed'; provider: 'YouTube' }
