import { type DefaultImageMediaItem, type SingleImageMediaItem, type VideoMediaItem, type MediaItem } from './MediaItem.js';
import { type PostEmbed, type YouTubePostEmbed } from './Post.js';

export interface Downloaded {
  mimeType?: string | null;
  /**
   * Path of downloaded file, relative to out directory.
   */
  path?: string | null;
  thumbnail?: {
    /**
     * Path of downloaded thumbnail, relative to out directory.
     */
    path?: string | null;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
  }
}

export type Downloadable<T extends MediaItem | PostEmbed = MediaItem | PostEmbed> = T & {
  downloaded?: Downloaded
};

export type DownloadableWithThumbnail =
  SingleImageMediaItem |
  DefaultImageMediaItem |
  VideoMediaItem;

export function isDownloadableWithThumbnail(item: Downloadable): item is DownloadableWithThumbnail & { thumbnailURL: string; } {
  return ((item.type === 'image' && (item.imageType === 'single' || item.imageType === 'default')) ||
    (item.type === 'video') ||
    (item.type === 'audio') ||
    isEmbed(item)) && !!item.thumbnailURL;
}
  

export function isYouTubeEmbed(embed: Downloadable<PostEmbed>): embed is Downloadable<YouTubePostEmbed> {
  return embed.provider === 'YouTube';
}

export function isEmbed(data: Downloadable): data is Downloadable<PostEmbed> {
  return data.type === 'videoEmbed' || data.type === 'linkEmbed' || data.type === 'unknownEmbed';
}
