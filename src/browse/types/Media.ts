import { type Campaign, type Post, type Product, type Tier } from "../../entities/index.js";
import { type ContentType } from "./Content.js";

export type MediaListSortBy = 'latest' | 'oldest';

export type GetMediaListParams<T extends ContentType> = {
  campaign?: Campaign | string;
  sourceType?: T;
  isViewable?: boolean;
  datePublished?: string; // 'YYYY' or 'YYYY-mm' (e.g. '2025-06')
  sortBy?: MediaListSortBy;
  limit?: number;
  offset?: number;
} & 
(
  T extends 'post' ? {
    tiers?: Tier[] | string[];
  }
  : T extends 'product' ? {}
  : never
);

export interface MediaListItem<T extends ContentType> {
  id: string;
  mediaType: 'image' | 'video' | 'audio' | 'pdf';
  mimeType: string | null;
  thumbnail: {
    path: string;
    width: number | null;
    height: number | null;
  } | null;
  source: T extends 'post' ? Post : T extends 'product' ? Product : Post | Product;
}

export interface MediaList<T extends ContentType> {
  items: MediaListItem<T>[];
  total: number;
}