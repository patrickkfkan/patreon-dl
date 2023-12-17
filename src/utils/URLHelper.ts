import path from 'path';
import { URL } from 'url';

const SITE_URL = 'https://www.patreon.com';
const COLLECTION_URL = `${SITE_URL}/collection`;
const PRODUCT_API_URL = `${SITE_URL}/api/product`;
const POSTS_API_URL = `${SITE_URL}/api/posts`;
const USER_API_URL = `${SITE_URL}/api/user`;
const CAMPAIGN_API_URL = `${SITE_URL}/api/campaigns`;

const PRODUCT_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/shop\/(([^/]+)-(\d+))$/;
const POSTS_BY_USER_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/posts$/;
const COLLECTION_URL_REGEX = /https:\/\/www\.patreon\.com\/collection\/(\d+)$/;
const POST_URL_REGEX = /https:\/\/www\.patreon\.com\/posts\/(([^/]+)-(\d+))$/;

const PRODUCT_API_URL_SEARCH_PARAMS = {
  PRODUCT_VARIANT: [
    'name',
    'id',
    'price_cents',
    'description',
    'is_hidden',
    'published_at_datetime',
    'url',
    'share_url',
    'access_metadata',
    'reward_ids',
    'moderation_status'
  ],
  INCLUDE: [
    'content_media',
    'preview_media',
    'content_media.custom_thumbnail_media',
    'campaign',
    'content_media.teaser_media'
  ]
};

const POSTS_API_URL_SEARCH_PARAMS = {
  INCLUDE: [
    'campaign',
    'access_rules',
    'attachments',
    'audio',
    'audio_preview.null',
    'images',
    'media',
    'native_video_insights',
    'poll.choices',
    'poll.current_user_responses.user',
    'poll.current_user_responses.choice',
    'poll.current_user_responses.poll',
    'user',
    'user_defined_tags',
    'ti_checks'
  ]
};

export enum PostSortOrder {
  PublisedAtDesc = '-published_at',
  PublishedAtAsc = 'published_at',
  CollectionOrder = 'collection_order'
}

export type URLAnalysis = {
  type: 'product';
  productId: string;
  slug: string;
} | {
  type: 'postsByUser';
  vanity: string;
  filters?: Record<string, any>;
} | {
  type: 'postsByCollection';
  collectionId: string;
  filters?: Record<string, any>;
} | {
  type: 'post';
  postId: string;
  slug: string;
}

export default class URLHelper {

  static constructProductAPIURL(productId: string) {
    const url = `${PRODUCT_API_URL}/${productId}`;
    const urlObj = new URL(url);
    urlObj.searchParams.set('fields[product-variant]', PRODUCT_API_URL_SEARCH_PARAMS.PRODUCT_VARIANT.join(','));
    urlObj.searchParams.set('include', PRODUCT_API_URL_SEARCH_PARAMS.INCLUDE.join(','));
    urlObj.searchParams.set('json-api-version', '1.0');

    return urlObj.toString();
  }

  static constructCampaignPageURL(vanity: string) {
    return `${SITE_URL}/${vanity}`;
  }

  static constructCollectionURL(collectionId: string) {
    return `${COLLECTION_URL}/${collectionId}`;
  }

  static constructUserAPIURL(userId: string) {
    return `${USER_API_URL}/${userId}`;
  }

  static constructCampaignAPIURL(campaignId: string) {
    return `${CAMPAIGN_API_URL}/${campaignId}`;
  }

  static constructPostsAPIURL(params: {
    postId?: string;
    campaignId?: string;
    currentUserId?: string;
    filters?: Record<string, any>;
    sort?: PostSortOrder;
  }) {
    if (!params.postId && !params.campaignId) {
      throw Error('Posts API URL requires at least \'postId\' or \'campaignId\'');
    }
    const urlObj = params.postId ? new URL(`${POSTS_API_URL}/${params.postId}`) : new URL(POSTS_API_URL);
    const defaultFilters: Record<string, any> = {
      'contains_exclusive_posts': true,
      'is_draft': false
    };
    if (params.campaignId) {
      defaultFilters['campaign_id'] = params.campaignId;
    }
    if (params.currentUserId) {
      defaultFilters['accessible_by_user_id'] = params.currentUserId;
    }
    const allFilters = {
      ...defaultFilters,
      ...params.filters || {}
    };
    const searchParams: Record<string, any> = {
      'include': POSTS_API_URL_SEARCH_PARAMS.INCLUDE.join(','),
      'sort': params.sort || PostSortOrder.PublisedAtDesc,
      'json-api-version': '1.0'
    };
    for (const [ key, value ] of Object.entries(allFilters)) {
      searchParams[`filter[${key}]`] = value;
    }
    for (const [ key, value ] of Object.entries(searchParams)) {
      urlObj.searchParams.set(key, value);
    }

    return urlObj.toString();
  }

  static analyzeURL(url: string): URLAnalysis | null {

    const base = this.stripSearchParamsFromURL(url);
    const searchParams = new URL(url).searchParams;

    const __getFiltersFromSearchParams = (searchParams: URLSearchParams) => {
      const filters: Record<string, any> = {};
      const filterRegex = /filters\[(.+?)\]/g;
      for (const [ key, value ] of searchParams) {
        const match = filterRegex.exec(key);
        if (match && match[1]) {
          filters[match[1]] = value;
        }
        filterRegex.lastIndex = 0;
      }
      return filters;
    };

    const productURLMatch = PRODUCT_URL_REGEX.exec(base);
    if (productURLMatch?.length === 5) {
      const productId = productURLMatch[4];
      const slug = productURLMatch[2];
      return {
        type: 'product',
        productId,
        slug
      };
    }

    const postsURLMatch = POSTS_BY_USER_URL_REGEX.exec(base);
    if (postsURLMatch && postsURLMatch[1]) {
      const vanity = postsURLMatch[1];
      const filters = __getFiltersFromSearchParams(searchParams);
      const result: URLAnalysis & { type: 'postsByUser' } = {
        type: 'postsByUser',
        vanity
      };
      if (Object.keys(filters).length > 0) {
        result.filters = filters;
      }

      return result;
    }

    const collectionURLMatch = COLLECTION_URL_REGEX.exec(base);
    if (collectionURLMatch && collectionURLMatch[1]) {
      const collectionId = collectionURLMatch[1];
      const filters = __getFiltersFromSearchParams(searchParams);
      if (!filters['collection_id']) {
        filters['collection_id'] = collectionId;
      }
      const result: URLAnalysis & { type: 'postsByCollection' } = {
        type: 'postsByCollection',
        collectionId
      };
      if (Object.keys(filters).length > 0) {
        result.filters = filters;
      }

      return result;
    }

    const postURLMatch = POST_URL_REGEX.exec(base);
    if (postURLMatch?.length === 4) {
      const postId = postURLMatch[3];
      const slug = postURLMatch[1];
      return {
        type: 'post',
        postId,
        slug
      };
    }

    return null;
  }

  static stripSearchParamsFromURL(url: string): string {
    const urlObj = new URL(url);
    let stripped = `${urlObj.origin}${urlObj.pathname}`;
    while (stripped.endsWith('/')) {
      stripped = stripped.substring(0, stripped.length - 1);
    }
    return stripped;
  }

  static getExtensionFromURL(url: string) {
    const urlObj = new URL(url);
    return path.extname(urlObj.pathname.split('/').pop() || '');
  }
}
