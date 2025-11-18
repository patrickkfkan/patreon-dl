import path from 'path';
import { URL } from 'url';
import { type UserIdOrVanityParam } from '../entities';

export const SITE_URL = 'https://www.patreon.com';
const COLLECTION_URL = `${SITE_URL}/collection`;
const CURRENT_USER_API_URL = `${SITE_URL}/api/current_user`;
const PRODUCT_API_URL = `${SITE_URL}/api/product`;
const POSTS_API_URL = `${SITE_URL}/api/posts`;
const USER_API_URL = `${SITE_URL}/api/user`;
const CAMPAIGN_API_URL = `${SITE_URL}/api/campaigns`;
const POST_COMMENTS_API_URL = `${SITE_URL}/api/posts/{POST_ID}/comments2`
const POST_COMMENT_REPLIES_API_URL = `${SITE_URL}/api/comments/{COMMENT_ID}/replies2`
const SHOP_API_URL = `${SITE_URL}/api/campaigns/{CAMPAIGN_ID}/products`

const PRODUCT_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/shop\/(([^/]+)-(\d+))$/;
const POSTS_BY_USER_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/posts$/;
const POSTS_BY_USER_URL_REGEX_2 = /https:\/\/www\.patreon\.com\/(?:c|cw)\/([^/]+?)\/posts$/;
const COLLECTION_URL_REGEX = /https:\/\/www\.patreon\.com\/collection\/(\d+)$/;
const POST_URL_REGEX = /https:\/\/www\.patreon\.com\/posts\/(([^/]+)-(\d+))$/;
const POST_URL_REGEX_2 = /https:\/\/www\.patreon\.com\/posts\/(\d+)$/; // No slug
const SHOP_URL_REGEX = /https:\/\/www\.patreon\.com\/([^/]+?)\/shop$/;
const SHOP_URL_REGEX_2 = /https:\/\/www\.patreon\.com\/(?:c|cw)\/([^/]+?)\/shop$/;

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

const SHOP_API_URL_SEARCH_PARAMS = {
  include: [
    'product-variant',
    'preview_media',
    'preview_media_no_fallback',
    'content_media',
    'content_media.custom_thumbnail_media',
    'post',
    'collection',
    'post.images',
    'post.embedv2',
    'post.video',
    'post.primary_image',
    'campaign',
    'access_rules',
    'access_rules.tier.null',
    'post.audio',
    'post.drop'
  ],
  fields: {
    'product-variant': [
      'name',
      'id',
      'price_cents',
      'checkout_url',
      'currency_code',
      'description',
      'description_rich_text',
      'is_hidden',
      'published_at_datetime',
      'url',
      'share_url',
      'access_metadata',
      'moderation_status',
      'reward_ids',
      'content_type',
      'is_featured',
      'live_sale_discounted_price_info'
    ],
    'content-unlock-option': [
      'content_unlock_type',
      'is_current_user_eligible'
    ],
    post: [
      'change_visibility_at',
      'comment_count',
      'content',
      'content_teaser_text',
      'cleaned_teaser_text',
      'image',
      'is_paid',
      'is_suspended',
      'moderation_status',
      'like_count',
      'media_file_duration_seconds',
      'min_cents_pledged_to_view',
      'post_file',
      'post_metadata',
      'post_type',
      'published_at',
      'pledge_url',
      'smart_navigation_media_id',
      'thumbnail',
      'thumbnail_url',
      'title',
      'url',
      'current_user_can_view',
      'external_embed_domain',
      'teaser_text',
      'teaser_text_json_string',
      'has_custom_thumbnail'
    ],
    collection: [
      'created_at',
      'current_user_access_context',
      'current_user_num_locked_posts',
      'description',
      'edited_at',
      'id',
      'moderation_status',
      'num_draft_posts',
      'num_posts',
      'num_posts_visible_for_creation',
      'num_scheduled_posts',
      'post_ids',
      'post_sort_type',
      'thumbnail',
      'title',
      'type',
      'share_images'
    ],
    'primary-image': [
      'image_icon',
      'image_small',
      'image_medium',
      'image_large',
      'primary_image_type',
      'alt_text',
      'image_colors'
    ]
  },
  filter: {
    'is_hidden': ['active'],
    'include_suspended': ['false'],
    'search_query': [],
    'include_featured': ['all_products']
  },
  page: {
    count: '24',
    pageType: 'offset',
    offset: '0'
  },
  sort: '-published_at',
  'json-api-version': '1.0',
  'json-api-use-default-includes': 'false'
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
} | {
  type: 'shop';
  vanity: string;
}

export default class URLHelper {

  static constructCurrentUserAPIURL() {
    const urlObj = new URL(CURRENT_USER_API_URL);
    urlObj.searchParams.set('include', 'active_memberships.campaign');
    urlObj.searchParams.set('fields[campaign]', 'avatar_photo_image_urls,name,published_at,url,vanity,is_nsfw,url_for_current_user');
    urlObj.searchParams.set('fields[member]', 'is_free_member,is_free_trial');
    urlObj.searchParams.set('json-api-version', '1.0');
    urlObj.searchParams.set('json-api-use-default-includes', 'false');
    return urlObj.toString();
  }

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

  static constructShopAPIURL(params: {
    campaignId: string;
    offset?: number;
  }) {
    const urlObj = new URL(SHOP_API_URL.replace('{CAMPAIGN_ID}', params.campaignId));
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(SHOP_API_URL_SEARCH_PARAMS.fields)) {
      fields[`fields[${k}]`] = v.join(',');
    }
    const filter: Record<string, string> = {};
    filter['filter[campaign_id]'] = params.campaignId;
    for (const [k, v] of Object.entries(SHOP_API_URL_SEARCH_PARAMS.filter)) {
      filter[`filter[${k}]`] = v.join(',');
    }
    const page: Record<string, string> = {};
    page['page[offset]'] = String(params.offset ?? 0);
    for (const [k, v] of Object.entries(SHOP_API_URL_SEARCH_PARAMS.page)) {
      page[`page[${k}]`] = v;
    }
    const searchParams: Record<string, any> = {
      ...fields,
      'include': SHOP_API_URL_SEARCH_PARAMS.include.join(','),
      ...filter,
      ...page,
      'sort': SHOP_API_URL_SEARCH_PARAMS.sort,
      'json-api-version': SHOP_API_URL_SEARCH_PARAMS['json-api-version'],
      'json-api-use-default-includes': SHOP_API_URL_SEARCH_PARAMS['json-api-use-default-includes'],
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

    const __urlMatchVanity = (regex: RegExp) => {
      const match = regex.exec(base);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    }
    const postsURLMatchVanity =
      __urlMatchVanity(POSTS_BY_USER_URL_REGEX) ||
      __urlMatchVanity(POSTS_BY_USER_URL_REGEX_2);
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

    const shopURLMatchVanity =
      __urlMatchVanity(SHOP_URL_REGEX) ||
      __urlMatchVanity(SHOP_URL_REGEX_2);
    if (shopURLMatchVanity) {
      return {
        type: 'shop',
        vanity:shopURLMatchVanity
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

  // Validates whether `url` is in format: https://www.patreon.com/file?h=...&m=...
  static isAttachmentLink(url: string) {
    if (this.validateURL(url)) {
      const urlObj = new URL(url);
      // Get 'h' (ownerId) and 'm' (mediaId)
      const ownerId = urlObj.searchParams.get('h');
      const mediaId = urlObj.searchParams.get('m');
      if (
        [
          'www.patreon.com',
          'patreon.com'
        ].includes(urlObj.hostname) &&
        urlObj.pathname === '/file' &&
        ownerId &&
        mediaId
      ) {
        return {
          validated: true as const,
          ownerId,
          mediaId
        };
      }
    }
    return {
      validated: false as const
    };
  }
}
