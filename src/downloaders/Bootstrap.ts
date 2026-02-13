import { existsSync } from 'fs';
import { type Post } from '../entities/Post.js';
import { type Product } from '../entities/Product.js';
import URLHelper from '../utils/URLHelper.js';
import path from 'path';

export type DownloaderType = Product | Post;

export interface BootstrapData {
  type: string;
  targetURL: string;
}

export interface ProductDownloaderBootstrapData extends BootstrapData {
  type: 'product';
  productFetch: {
    type: 'single';
    productId: string;
  } | {
    type: 'byShop';
    vanity: string;
    campaignId?: string;
  } | {
    type: 'byFile';
    filePath: string;
  };
}

export interface PostDownloaderBootstrapData extends BootstrapData {
  type: 'post';
  postFetch: {
    type: 'single';
    postId: string;
  } | {
    type: 'byUser';
    vanity: string;
    filters?: Record<string, any>;
    campaignId?: string;
  } | {
    type: 'byUserId';
    userId: string;
    filters?: Record<string, any>;
    campaignId?: string;
  } | {
    type: 'byCollection';
    collectionId: string;
    filters?: Record<string, any>;
    campaignId?: string;
  } | {
    type: 'byFile';
    filePath: string;
  };
}

export type DownloaderBootstrapData<T extends DownloaderType> =
  T['type'] extends 'product' ? ProductDownloaderBootstrapData :
  T['type'] extends 'post' ? PostDownloaderBootstrapData :
  never;

export default class Bootstrap {

  static getDownloaderBootstrapDataByURL(url: string) {
    // Check if url points to local API data file.
    // This is for debugging purposes.
    const fileExists = existsSync(url);
    if (fileExists && path.basename(url) === 'post-api.json') {
      return {
        type: 'post',
        targetURL: url,
        postFetch: {
          type: 'byFile',
          filePath: path.resolve(url)
        }
      } satisfies PostDownloaderBootstrapData;
    }

    // Likewise for 'product-api.json'
    if (fileExists && path.basename(url) === 'product-api.json') {
      return {
        type: 'product',
        targetURL: url,
        productFetch: {
          type: 'byFile',
          filePath: path.resolve(url)
        }
      } satisfies ProductDownloaderBootstrapData;
    }

    const analysis = URLHelper.analyzeURL(url);
    if (!analysis) {
      return null;
    }

    if (analysis.type === 'product') {
      return {
        type: 'product',
        targetURL: url,
        productFetch: {
          type: 'single',
          productId: analysis.productId
        }
      } as ProductDownloaderBootstrapData;
    }

    if (analysis.type === 'shop') {
      return {
        type: 'product',
        targetURL: url,
        productFetch: {
          type: 'byShop',
          vanity: analysis.vanity
        }
      } as ProductDownloaderBootstrapData;
    }

    if (analysis.type === 'postsByUser') {
      return {
        type: 'post',
        targetURL: url,
        postFetch: {
          type: 'byUser',
          vanity: analysis.vanity,
          filters: analysis.filters
        }
      } as PostDownloaderBootstrapData;
    }

    if (analysis.type === 'postsByUserId') {
      return {
        type: 'post',
        targetURL: url,
        postFetch: {
          type: 'byUserId',
          userId: analysis.userId,
          filters: analysis.filters
        }
      } as PostDownloaderBootstrapData;
    }

    if (analysis.type === 'postsByCollection') {
      return {
        type: 'post',
        targetURL: url,
        postFetch: {
          type: 'byCollection',
          collectionId: analysis.collectionId,
          filters: analysis.filters
        }
      } as PostDownloaderBootstrapData;
    }

    if (analysis.type === 'post') {
      return {
        type: 'post',
        targetURL: url,
        postFetch: {
          type: 'single',
          postId: analysis.postId,
          slug: analysis.slug
        }
      } as PostDownloaderBootstrapData;
    }

    return null;
  }
}
