import { SingleImageMediaItem } from './MediaItem.js';

export interface User {
  type: 'user';
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string | null;
  image: SingleImageMediaItem;
  thumbnail: SingleImageMediaItem;
  url: string;
  vanity: string | null;
  raw: object;
}

export type UserIdOrVanityParam = { userId: string; vanity?: undefined } | { userId?: undefined; vanity: string };
