import { Attachment } from './Attachment.js';
import { MediaItem } from './MediaItem.js';
import { PostEmbed, YouTubePostEmbed } from './Post.js';

export type Downloadable = MediaItem | Attachment | PostEmbed;

export function isYouTubeEmbed(embed: PostEmbed): embed is YouTubePostEmbed {
  return embed.type === 'videoEmbed' && embed.provider === 'YouTube';
}

export function isEmbed(data: Downloadable): data is PostEmbed {
  return data.type === 'videoEmbed' || data.type === 'linkEmbed' || data.type === 'unknownEmbed';
}
