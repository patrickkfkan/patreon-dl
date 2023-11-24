import { Attachment } from './Attachment.js';
import { MediaItem } from './MediaItem.js';

export type Downloadable = MediaItem | Attachment;

export const DOWNLOADABLE_TYPES = [ 'media', 'attachment' ] as const;

export function isTypeDownloadable(type: string): type is typeof DOWNLOADABLE_TYPES[number] {
  return DOWNLOADABLE_TYPES.includes(type as any);
}
