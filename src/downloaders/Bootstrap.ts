import { Post } from '../entities/Post.js';
import { Product } from '../entities/Product.js';
import URLHelper from '../utils/URLHelper.js';

export type DownloaderType = Product | Post;

export interface BootstrapData {
  type: string;
  targetURL: string;
}

export interface ProductDownloaderBootstrapData extends BootstrapData {
  type: 'product';
  productId: string;
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
  } | {
    type: 'byCollection';
    collectionId: string;
    filters?: Record<string, any>;
  };
}

export type DownloaderBootstrapData<T extends DownloaderType> =
  T['type'] extends 'product' ? ProductDownloaderBootstrapData :
  T['type'] extends 'post' ? PostDownloaderBootstrapData :
  never;

export default class Bootstrap {

  static getDownloaderBootstrapDataByURL(url: string) {
    const analysis = URLHelper.analyzeURL(url);
    if (!analysis) {
      return null;
    }

    if (analysis.type === 'product') {
      return {
        type: 'product',
        targetURL: url,
        productId: analysis.productId
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
