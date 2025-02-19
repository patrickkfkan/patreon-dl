import path from 'path';
import { URL } from 'url';
import { type UserIdOrVanityParam } from '../entities';

const SITE_URL = 'https://www.patreon.com';
const COLLECTION_URL = `${SITE_URL}/collection`;
const PRODUCT_API_URL = `${SITE_URL}/api/product`;
const POSTS_API_URL = `${SITE_URL}/api/posts`;
const USER_API_URL = `${SITE_URL}/api/user`;
const CAMPAIGN_API_URL = `${SITE_URL}/api/campaigns`;
const POST_COMMENTS_API_URL = `${SITE_URL}/api/posts/{POST_ID}/comments2`
const POST_COMMENT_REPLIES_API_URL = `${SITE_URL}/api/comments/{COMMENT_ID}/replies2`

const PRODUCT_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/shop\/(([^/]+)-(\d+))$/;
const POSTS_BY_USER_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/posts$/;
const POSTS_BY_USER_URL_REGEX_2 = /https:\/\/www\.patreon\.com\/(?:c|cw)\/([^/]+?)\/posts$/;
const COLLECTION_URL_REGEX = /https:\/\/www\.patreon\.com\/collection\/(\d+)$/;
const POST_URL_REGEX = /https:\/\/www\.patreon\.com\/posts\/(([^/]+)-(\d+))$/;
const POST_URL_REGEX_2 = /https:\/\/www\.patreon\.com\/posts\/(\d+)$/; // No slug

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
    'access_rules.tier.null',
    'attachments_media',
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

const POST_COMMENTS_API_URL_SEARCH_PARAMS = {
  INCLUDE: [
    'parent',
    'post',
    'on_behalf_of_campaign.null',
    'commenter.campaign.null',
    'first_reply.commenter.campaign.null',
    'first_reply.parent',
    'first_reply.post',
    'first_reply.on_behalf_of_campaign.null'
  ],
  FIELDS: {
    COMMENT: [
      'body',
      'created',
      'deleted_at',
      'is_by_patron',
      'is_by_creator',
      'is_liked_by_creator',
      'vote_sum',
      'current_user_vote',
      'reply_count',
      'visibility_state'
    ],
    CAMPAIGN: [],
    POST: [
      'comment_count',
      'current_user_can_comment',
      'url'
    ],
    POST_TAG: [
      'tag_type',
      'value'
    ],
    USER: [
      'image_url',
      'full_name',
      'url'
    ]
  },
  COUNT: 50,
  SORT: '-created'
};

const POST_COMMENT_REPLIES_API_URL_SEARCH_PARAMS = {
  INCLUDE: [
    'commenter.campaign',
    'parent',
    'post',
    'on_behalf_of_campaign'
  ],
  FIELDS: {
    CAMPAIGN: [],
    COMMENT: [
      'body',
      'created',
      'deleted_at',
      'is_by_patron',
      'is_by_creator',
      'is_liked_by_creator',
      'vote_sum',
      'current_user_vote',
      'visibility_state'
    ],
    POST: [
      'comment_count'
    ],
    USER: [
      'image_url',
      'full_name',
      'url'
    ]
  },
  COUNT: 50,
  SORT: 'created'
}

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
  type: 'postsByUserId';
  userId: string;
  filters?: Record<string, any>;
} | {
  type: 'postsByCollection';
  collectionId: string;
  filters?: Record<string, any>;
} | {
  type: 'post';
  postId: string;
  slug?: string;
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

  static constructCampaignPageURL(user: UserIdOrVanityParam) {
    if (user.vanity) {
      return `${SITE_URL}/${user.vanity}`;
    }

    return `${SITE_URL}/user?u=${user.userId}`;
  }

  static constructUserPostsURL(user: UserIdOrVanityParam) {
    if (user.vanity) {
      return `${SITE_URL}/${user.vanity}/posts`;
    }

    return `${SITE_URL}/user/posts?u=${user.userId}`;
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

  static constructPostCommentsAPIURL(params: {
    postId: string,
    replies?: false
    count?: number;
  } | {
    commentId: string,
    replies: true,
    count?: number
  }) {
    let urlObj: URL;
    if (params.replies) {
      urlObj = new URL(POST_COMMENT_REPLIES_API_URL.replace('{COMMENT_ID}', params.commentId));
    }
    else {
      urlObj = new URL(POST_COMMENTS_API_URL.replace('{POST_ID}', params.postId));
    }
    const fields: Record<string, string> = {};
    const bundle = params.replies ? POST_COMMENT_REPLIES_API_URL_SEARCH_PARAMS : POST_COMMENTS_API_URL_SEARCH_PARAMS;
    for (const [k, v] of Object.entries(bundle.FIELDS)) {
      fields[`fields[${k.toLowerCase()}]`] = v.join(',') || '[]'
    }
    const searchParams: Record<string, any> = {
      'include': bundle.INCLUDE.join(','),
      ...fields,
      'page[count]': params.count || bundle.COUNT,
      'sort': bundle.SORT,
      'json-api-version': '1.0',
      'json-api-use-default-includes': false
    };
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

    const __getPostsURLMatchVanity = (regex: RegExp) => {
      const match = regex.exec(base);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }
    const postsURLMatchVanity =
      __getPostsURLMatchVanity(POSTS_BY_USER_URL_REGEX) ||
      __getPostsURLMatchVanity(POSTS_BY_USER_URL_REGEX_2);
    if (postsURLMatchVanity) {
      const vanity = postsURLMatchVanity;
      const filters = __getFiltersFromSearchParams(searchParams);
      let result: URLAnalysis & { type: 'postsByUser' | 'postsByUserId' };
      // Test if match https://www.patreon.com/user/posts?u={userId}
      const userId = searchParams.get('u')?.trim();
      if (vanity === 'user' && userId) {
        result = {
          type: 'postsByUserId',
          userId
        };
      }
      else {
        result = {
          type: 'postsByUser',
          vanity
        };
      }
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

    const postURLMatch2 = POST_URL_REGEX_2.exec(base);
    if (postURLMatch2?.length === 2) {
      const postId = postURLMatch2[1];
      return {
        type: 'post',
        postId
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

  static validateURL(url: any) {
    let urlObj;
    try {
      urlObj = new URL(url);
    }
    catch (_error: unknown) {
      return false;
    }
    return !!urlObj;
  }
}
