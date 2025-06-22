import { type Downloadable } from './Downloadable.js';
import { type SingleImageMediaItem } from './MediaItem.js';

export interface User {
  type: 'user';
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string | null;
  image: Downloadable<SingleImageMediaItem>;
  thumbnail: Downloadable<SingleImageMediaItem>;
  url: string;
  vanity: string | null;
  raw: object;
}

export type UserIdOrVanityParam = { userId: string; vanity?: never } | { userId?: never; vanity: string };
