import { type Campaign, type Comment, type Post, type Product, type Tier } from "../../entities/index.js";

export type ContentListSortBy = 'a-z' | 'z-a' | 'latest' | 'oldest';
export type ContentType = 'post' | 'product';

export interface PostWithComments extends Post {
  comments: Comment[] | null;
}

export type GetContentListParams<T extends ContentType> =
{
  campaign?: Campaign | string;
  type?: T;
  isViewable?: boolean;
  datePublished?: string; // 'YYYY' or 'YYYY-mm' (e.g. '2025-06')
  sortBy?: ContentListSortBy;
  limit?: number;
  offset?: number;
} & 
(
  T extends 'post' ? {
    postTypes?: string[];
    tiers?: Tier[] | string[];
  }
  : T extends 'product' ? {}
  : never
);

export interface ContentList<T extends ContentType> {
  items: (
    T extends 'post' ? PostWithComments
    : T extends 'product' ? Product
    : PostWithComments | Product
  )[];
  total: number;
}