import { Attachment } from './Attachment.js';
import { MediaItem } from './MediaItem.js';
import { PostEmbed, YouTubePostEmbed } from './Post.js';

export type Downloadable = MediaItem | Attachment | YouTubePostEmbed;

export function isYouTubeEmbed(embed: PostEmbed): embed is YouTubePostEmbed {
  return embed.type === 'videoEmbed' && embed.provider === 'YouTube';
}
