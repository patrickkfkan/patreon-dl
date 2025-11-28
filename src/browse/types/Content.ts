import { type Campaign, type Comment, type Post, type Product, type Tier } from "../../entities/index.js";
import { type PostTag, type Collection } from "../../entities/Post.js";

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
  limit?: number;
  offset?: number;
} & 
(
  T extends 'post' ? {
    postTypes?: string[];
    tiers?: Tier[] | string[];
    collection?: Collection | string;
    tag?: PostTag | string;
  }
  : T extends 'product' ? {}
  : never
) & (
  {
    search: string;
    sortBy?: ContentListSortBy | 'best_match';
  } | {
    search?: undefined;
    sortBy?: ContentListSortBy;
  }
);

export interface ContentList<T extends ContentType> {
  items: (
    T extends 'post' ? PostWithComments
    : T extends 'product' ? Product
    : PostWithComments | Product
  )[];
  total: number;
}

export type GetContentContext<T extends ContentType> = Omit<GetContentListParams<T>, 'limit' | 'offset'>;

export type GetPreviousNextContentResult<T extends ContentType> =
  T extends 'post' ? {
    previous: PostWithComments | null;
    next: PostWithComments | null;
  }
  : T extends 'product' ? {
    previous: Product | null;
    next: Product | null;
  }
  : never;

export type CollectionListSortBy = 'a-z' | 'z-a' | 'last_created' | 'last_updated';

export interface GetCollectionListParams {
  campaign: Campaign | string;
  search?: string;
  sortBy?: CollectionListSortBy;
  limit?: number;
  offset?: number;
}

export interface CollectionList {
  collections: Collection[];
  total: number;
}

export interface GetPostTagListParams {
  campaign: Campaign | string;
}

export interface PostTagList {
  tags: PostTag[];
  total: number;
}

export type SearchContentParams = {
  campaign?: Campaign | string;
  query: string;
} & ({
  type: 'post';
  collection?: Collection;
  sortBy: ContentListSortBy | 'best_match';
} | {
  type: 'product';
  sortBy: ContentListSortBy | 'best_match';
} | {
  type: 'collection';
  sortBy: CollectionListSortBy | 'best_match';
})