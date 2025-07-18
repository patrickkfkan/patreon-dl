import capitalize from 'capitalize';
import { load as cheerioLoad } from 'cheerio';
import { type Campaign } from '../entities/Campaign.js';
import { type Downloadable } from '../entities/Downloadable.js';
import { type CampaignCoverPhotoMediaItem, type DefaultImageMediaItem, type MediaItem, type SingleImageMediaItem } from '../entities/MediaItem.js';
import { type User } from '../entities/User.js';
import {type LogLevel} from '../utils/logging/Logger.js';
import type Logger from '../utils/logging/Logger.js';
import { commonLog } from '../utils/logging/Logger.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import { type Reward, type Tier } from '../entities/Reward.js';
import URLHelper from '../utils/URLHelper.js';
import FSHelper from '../utils/FSHelper.js';

const DOWNLOADABLE_TYPES = [ 'media' ] as const;

export default abstract class Parser {

  protected abstract name: string;

  #logger?: Logger | null;

  constructor(logger?: Logger | null) {
    this.#logger = logger;
  }

  parseCampaignAPIResponse(res: any) {
    const { data, included } = res;
    if (!included || !Array.isArray(included)) {
      this.log('error', '\'included\' field missing in API data of campaign or has incorrect type');
      return null;
    }
    return this.parseCampaignAPIDataInIncludedArray(data, included);
  }

  /**
   *
   * @param relationships `data[index].relationships`, where `data[index]` corresponds
   * to a product or post returned in an API response.
   * @param targets Fields in `relationships` to process, e.g. `audio`, `images`
   * @param included The `included` array of API response
   * @param parentName The name of the parent item containing `relationships`; for logging purpose.
   * @returns
   */
  protected fetchDownloadablesFromRelationships<T extends Record<string, string>>(
    relationships: any,
    targets: T,
    included: any,
    parentName: string,
    warnOnTargetNotFound = true): Partial<Record<keyof T, Downloadable[]>> {

    const result: Partial<Record<keyof T, Downloadable[]>> = {};

    for (const [ target, targetName ] of Object.entries<string>(targets)) {
      this.log('debug', `Fetch downloadable ${targetName} from ${parentName} ('relationships.${target}')`);
      const rel = relationships[target];
      /**
       * A relationship is an object that takes one of two forms.
       * E.g. for 'images':
       * { "data": [ { "id": "12345", "type": "media" } ...] }
       *
       * For 'audio':
       *
       * { "data": { "id": "246113102", "type": "media" } }
       *
       * So `rel` must consist of `data`, which can be an object or an array of objects,
       * with each object having `id` and `type`.
       */
      const relData = rel && typeof rel === 'object' ? rel.data : null;
      let rData: { id: any; type: any }[] | null = null; // Normalized data
      if (relData) {
        if (Array.isArray(relData)) {
          if (relData.every((r) => typeof r === 'object' && r.id && r.type)) {
            rData = relData;
          }
        }
        else if (typeof relData === 'object') {
          if (relData.id && relData.type) {
            rData = [ relData ];
          }
        }
      }

      if (!rData || rData.length === 0) {
        if (warnOnTargetNotFound) {
          this.log('warn', `${capitalize(targetName)} not found in API data of ${parentName} ('relationships.${target}')`);
        }
        continue;
      }

      this.log('debug', `Parse ${targetName}`);
      const fetched: Downloadable[] = [];
      let total = 0;
      let found = 0;
      for (const m of rData) {
        const { id, type } = m;
        if (id && type && this.isTypeDownloadable(type)) {
          total++;
          let mi;
          if (type === 'media') {
            const unknownMediaTypeAs =
              target === 'audio' ? 'audio' :
              target === 'audio_preview' ? 'audio' :
              target === 'images' ? 'image' :
              target === 'attachments_media' ? 'attachment' :
              undefined;
            mi = this.findInAPIResponseIncludedArray(included, id, type, unknownMediaTypeAs);
          }
          else {
            mi = this.findInAPIResponseIncludedArray(included, id, type);
          }
          if (mi) {
            found++;
            fetched.push(mi);
          }
        }
        else {
          this.log('debug', `Skipped non-downloadable item #${id} (type: ${type})`);
        }
      }
      if (total === found) {
        this.log('debug', `All ${total} downloadable ${targetName} parsed`);
      }
      else {
        this.log('warn', `${found} / ${total} downloadable ${targetName} parsed for ${parentName}`);
      }
      result[target as keyof T] = fetched;
    }

    return result;
  }

  protected isTypeDownloadable(type: string): type is typeof DOWNLOADABLE_TYPES[number] {
    return DOWNLOADABLE_TYPES.includes(type as any);
  }

  /**
   * A JSON API response typically contain an `included` field, which is an array
   * of items (media, campaign, reward, etc.) that are referenced through its `id`
   * by items contained in the `data` field of the same response.
   *
   * Items in the `included` field contain extra info, such as media URLs,
   * not provided in the `data` items referencing it.
   */
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: typeof DOWNLOADABLE_TYPES[number]): Downloadable | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: 'tier', campaign: Campaign): Tier | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: 'media', unknownMediaTypeAs: 'image', fallbackData?: Record<string, any>): Downloadable<MediaItem> | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: 'media', unknownMediaTypeAs?: 'image' | 'video' | 'audio' | 'file' | 'attachment'): Downloadable<MediaItem> | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: 'reward'): Reward | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: 'user', asCreator?: boolean): User | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: 'campaign'): Campaign | null;
  protected findInAPIResponseIncludedArray(included: Array<any>, id: string, matchType: string, ...args: any[]): any {
    this.log('debug', `Find ${matchType} item #${id} in API response`);
    for (const inc of included) {
      const _matchType =
        matchType === 'tier' ? 'access-rule' :
        matchType;
      if (inc && typeof inc === 'object' && inc.id === id && inc.type === _matchType) {
        this.log('debug', 'Found - parse item data');

        if (_matchType === 'access-rule') {
          return this.parseTierAPIDataInIncludedArray(inc, args[0]);
        }
        else if (_matchType === 'media') {
          return this.parseMediaItemAPIDataInIncludedArray(inc, args[0]);
        }
        else if (_matchType === 'campaign') {
          return this.parseCampaignAPIDataInIncludedArray(inc, included);
        }
        else if (_matchType === 'user') {
          return this.parseUserAPIDataInIncludedArray(inc, args[0]);
        }
        else if (_matchType === 'reward') {
          return this.parseRewardAPIDataInIncludedArray(inc);
        }
      }
    }

    if (matchType === 'media' && args[0] === 'image' && args[1]) {
      return this.parseMediaItemAPIDataInIncludedArray(args[1], args[0]);
    }

    this.log('warn', `Item #${id} not found in API response or has invalid data`);
    return null;
  }

  protected parseTierAPIDataInIncludedArray(data: any, campaign: Campaign): Tier | null {
    const { attributes, relationships } = data;
    const accessRuleType = ObjectHelper.getProperty(attributes, 'access_rule_type');
    switch (accessRuleType) {
      case 'patrons':
        return {
          id: 'patrons',
          title: 'Patrons'
        };
      case 'public':
        return {
          id: '-1',
          title: 'Public'
        };
      case 'tier': {
        const tierId = ObjectHelper.getProperty(relationships, 'tier.data.id');
        const tierType = ObjectHelper.getProperty(relationships, 'tier.data.type');
        if (tierType === 'reward' && tierId) {
          const reward = campaign.rewards.find((r) => r.id === tierId);
          if (reward) {
            return {
              id: reward.id,
              title: reward.title
            };
          }
        }
        break;
      }
      default:
        return null;
    }
    return null;
  }

  protected parseMediaItemAPIDataInIncludedArray(data: any, unknownMediaTypeAs?: 'image' | 'video' | 'audio' | 'file') {
    const { id, attributes } = data;
    if (!id) {
      this.log('error', 'Parse error: \'id\' field missing in API data of media item');
      return null;
    }
    if (!attributes || typeof attributes !== 'object') {
      this.log('error', `Parse error: 'attributes' field missing in API data of media item #${id} or has incorrect type`);
      return null;
    }

    const {
      file_name: filename = null,
      mimetype: mimeType = null,
      media_type: mediaType = null,
      created_at: createdAt = null
    } = attributes;

    let mi: MediaItem | null = null;
    if (mimeType === 'application/x-mpegURL' || mimeType?.startsWith('video/') || mediaType === 'video' || unknownMediaTypeAs === 'video') {
      mi = {
        type: 'video',
        id,
        filename,
        createdAt,
        mimeType,
        size: {
          width: ObjectHelper.getProperty(attributes, 'display.width') || null,
          height: ObjectHelper.getProperty(attributes, 'display.height') || null
        },
        duration: ObjectHelper.getProperty(attributes, 'display.duration') || null,
        /**
         * `attributes.download_url` in `included` array returns 404. Need to use `display.url`.
         * For posts, actual download URL for accessible videos is encapsulated in `data.attributes.post_file`.
         * That part is handled by `PostParser`.
         */
        // DownloadURL: attributes.download_url || null,
        downloadURL: null,
        displayURL: ObjectHelper.getProperty(attributes, 'display.url') || null,
        thumbnailURL: ObjectHelper.getProperty(attributes, 'display.default_thumbnail.url') || null
      };
    }
    else if (mimeType?.startsWith('image/') || mediaType === 'image' || unknownMediaTypeAs === 'image') {
      mi = {
        type: 'image',
        imageType: 'default',
        id,
        filename,
        createdAt,
        mimeType,
        downloadURL: attributes.download_url || null,
        imageURLs: {
          default: ObjectHelper.getProperty(attributes, 'image_urls.default') || null,
          defaultSmall: ObjectHelper.getProperty(attributes, 'image_urls.default_small') || null,
          original: ObjectHelper.getProperty(attributes, 'image_urls.original') || null,
          thumbnail: ObjectHelper.getProperty(attributes, 'image_urls.thumbnail') || null,
          thumbnailLarge: ObjectHelper.getProperty(attributes, 'image_urls.thumbnail_large') || null,
          thumbnailSmall: ObjectHelper.getProperty(attributes, 'image_urls.thumbnail_small') || null
        },
        // Thumbnails are squared. Patreon uses default_large, so we use that as well.
        thumbnailURL: ObjectHelper.getProperty(attributes, 'image_urls.default_large') || null
      };
    }
    else if (mimeType?.startsWith('audio/') || mediaType === 'audio' || unknownMediaTypeAs === 'audio') {
      mi = {
        type: 'audio',
        id,
        filename,
        createdAt,
        mimeType,
        /**
         * Audio item data in API response can have identical structure as image, i.e. with `image_urls.thumbnail`,
         * `image_urls.original`, etc. These URLs all point to the same file, so it's only necessary to return
         * a single URL.
         */
        url: ObjectHelper.getProperty(attributes, 'image_urls.original') ||
          ObjectHelper.getProperty(attributes, 'image_urls.default') ||
          attributes.download_url ||
          ObjectHelper.getProperty(attributes, 'image_urls.default_small') ||
          ObjectHelper.getProperty(attributes, 'image_urls.thumbnail_large') ||
          ObjectHelper.getProperty(attributes, 'image_urls.thumbnail') ||
          ObjectHelper.getProperty(attributes, 'image_urls.thumbnail_small') ||
          null,
        thumbnailURL: null
      };
    }
    else if (mediaType === 'file' || unknownMediaTypeAs === 'file') {
      mi = {
        type: 'file',
        id,
        filename,
        createdAt,
        mimeType,
        downloadURL: attributes.download_url || null // TODO: test this
      };
    }
    else if (attributes.owner_relationship === 'attachment' || unknownMediaTypeAs === 'attachment') {
      mi = {
        type: 'attachment',
        id,
        filename: attributes.file_name || null,
        downloadURL: attributes.download_url || null,
        mimeType
      };
    }
    else {
      this.log('warn', `Media item #${id} has unrecognized media type '${mediaType}' or mime type '${mimeType}'`);
    }

    if (mi) {
      this.log('debug', `Done parsing media item #${id} (type: ${mi.type})`);
    }

    return mi;
  }

  protected parseCampaignAPIDataInIncludedArray(data: any, included: Array<any>) {
    const { id, attributes } = data;
    if (!id) {
      this.log('error', 'Parse error: \'id\' field missing in API data of campaign');
      return null;
    }
    if (!attributes || typeof attributes !== 'object') {
      this.log('error', `Parse error: 'attributes' field missing in API data of campaign #${id} or has incorrect type`);
      return null;
    }

    const rewards: Reward[] = [];
    const rewardsData = ObjectHelper.getProperty(data, 'relationships.rewards.data');
    if (rewardsData && Array.isArray(rewardsData)) {
      let invalidRewardDataCount = 0;
      for (const rewardData of rewardsData) {
        if (typeof rewardData === 'object') {
          const { id: rewardId, type } = rewardData;
          if (type !== 'reward') {
            continue;
          }
          if (rewardId === undefined) {
            invalidRewardDataCount++;
            continue;
          }
          const reward = this.findInAPIResponseIncludedArray(included, rewardId, 'reward');
          if (reward) {
            rewards.push(reward);
          }
          else {
            invalidRewardDataCount++;
          }
        }
        else {
          invalidRewardDataCount++;
        }
      }
      if (invalidRewardDataCount > 0) {
        this.log('warn', `${invalidRewardDataCount} rewards for campaign #${id} could not be parsed due to invalid data`);
      }
    }
    else {
      this.log('warn', `Rewards data for campaign #${id} is missing or has incorrect type`);
    }

    const creatorId = ObjectHelper.getProperty(data, 'relationships.creator.data.id');
    const creatorType = ObjectHelper.getProperty(data, 'relationships.creator.data.type');
    let creator: User | null = null;
    if (!creatorId) {
      this.log('warn', `Creator ID missing in API data of campaign #${id} - no creator info will be available`);
    }
    else if (creatorType !== 'user') {
      this.log('warn', `Creator of campaign #${id} has incorrect type (expecting 'user' but got '${creatorType}') - no creator info will be available`);
    }
    else {
      this.log('debug', `Obtain creator info (user ID '${creatorId}')`);
      creator = this.findInAPIResponseIncludedArray(included, creatorId, 'user', true);
    }
    const thumbnail = ObjectHelper.getProperty(attributes, 'avatar_photo_image_urls.thumbnail') || null;
    const thumbnailLarge = ObjectHelper.getProperty(attributes, 'avatar_photo_image_urls.thumbnail_large') || null;
    const thumbnailSmall = ObjectHelper.getProperty(attributes, 'avatar_photo_image_urls.thumbnail_small') || null;
    const avatarImage: Downloadable<DefaultImageMediaItem> = {
      type: 'image',
      id: `campaign:${id}:avatar`,
      filename: 'avatar',
      createdAt: null,
      mimeType: null,
      downloadURL: null,
      imageType: 'default',
      imageURLs: {
        default: ObjectHelper.getProperty(attributes, 'avatar_photo_image_urls.default') || null,
        defaultSmall: ObjectHelper.getProperty(attributes, 'avatar_photo_image_urls.default_small') || null,
        original: ObjectHelper.getProperty(attributes, 'avatar_photo_image_urls.original') || null,
        thumbnail,
        thumbnailLarge,
        thumbnailSmall
      },
      thumbnailURL: thumbnailLarge || thumbnail || thumbnailSmall
    };
    const coverPhoto: Downloadable<CampaignCoverPhotoMediaItem> = {
      type: 'image',
      id: `campaign:${id}:cover`,
      filename: 'cover-photo',
      mimeType: null,
      imageType: 'campaignCoverPhoto',
      imageURLs: {
        large: ObjectHelper.getProperty(attributes, 'cover_photo_url_sizes.large') || null,
        medium: ObjectHelper.getProperty(attributes, 'cover_photo_url_sizes.medium') || null,
        small: ObjectHelper.getProperty(attributes, 'cover_photo_url_sizes.small') || null,
        xlarge: ObjectHelper.getProperty(attributes, 'cover_photo_url_sizes.xlarge') || null,
        xsmall: ObjectHelper.getProperty(attributes, 'cover_photo_url_sizes.xsmall') || null
      }
    };

    const campaign: Campaign = {
      type: 'campaign',
      id,
      name: attributes.name,
      createdAt: attributes.created_at || null,
      publishedAt: attributes.published_at || null,
      avatarImage,
      coverPhoto,
      summary: attributes.summary,
      url: attributes.url || null,
      currency: attributes.currency || null,
      rewards,
      creator,
      raw: data
    };
    this.log('debug', `Done parsing campaign #${id}`);
    return campaign;
  }

  protected parseUserAPIDataInIncludedArray(data: any, asCreator = false) {
    const { id, attributes } = data;
    if (!id) {
      this.log('error', 'Parse error: \'id\' field missing in API data of user');
      return null;
    }
    if (!attributes || typeof attributes !== 'object') {
      this.log('error', `Parse error: 'attributes' field missing in API data of user #${id} or has incorrect type`);
      return null;
    }
    const image: SingleImageMediaItem = {
      type: 'image',
      id: `user:${id}:image`,
      filename: asCreator ? 'creator-image' : 'user-image',
      mimeType: null,
      imageType: 'single',
      imageURL: attributes.image_url || null,
      thumbnailURL: attributes.thumb_url || null
    };
    const thumbnail: SingleImageMediaItem = {
      type: 'image',
      id: `user:${id}:thumbnail`,
      filename: asCreator ? 'creator-thumbnail' : 'user-thumbnail',
      mimeType: null,
      imageType: 'single',
      imageURL: attributes.thumb_url || null,
      thumbnailURL: null
    };
    const user: User = {
      type: 'user',
      id,
      firstName: attributes.first_name,
      lastName: attributes.last_name,
      fullName: attributes.full_name,
      createdAt: attributes.created || null,
      image,
      thumbnail,
      url: attributes.url,
      vanity: attributes.vanity,
      raw: data
    };
    this.log('debug', `Done parsing user #${id}`);
    return user;
  }

  protected parseRewardAPIDataInIncludedArray(data: any) {
    const { id, attributes } = data;
    if (!id) {
      this.log('error', 'Parse error: \'id\' field missing in API data of reward');
      return null;
    }
    if (!attributes || typeof attributes !== 'object') {
      this.log('error', `Parse error: 'attributes' field missing in API data of reward #${id} or has incorrect type`);
      return null;
    }
    const amountCents = attributes.amount_cents !== undefined ? attributes.amount_cents : null;
    const amountCurrency = attributes.currency || null;
    let amount: string | null = null;
    if (amountCents !== null && !isNaN(Number(amountCents)) && amountCurrency !== null) {
      amount = `${Number(amountCents) / 100} ${amountCurrency}`;
    }
    const title = attributes.title || null;
    const rewardFilenameSuffix = title ? ` (${title})` : `-${id}`;
    const image: SingleImageMediaItem | null = attributes.image_url ? {
      type: 'image',
      id: `reward:${id}:image`,
      filename: `reward${rewardFilenameSuffix}`,
      mimeType: null,
      imageType: 'single',
      imageURL: attributes.image_url,
      thumbnailURL: null
    } : null;
    const reward: Reward = {
      type: 'reward',
      id,
      title,
      description: attributes.description || null,
      amount,
      createdAt: attributes.created_at || null,
      publishedAt: attributes.published_at || null,
      editedAt: attributes.edited_at || null,
      image,
      url: attributes.url || null
    };
    this.log('debug', `Done parsing reward #${id}`);
    return reward;
  }

  protected parseInlineMedia(postId: string, content: string, included: Array<any>) {
    // PATCH: External images support
    const $ = cheerioLoad(content);

    // Patreon images
    // <img data-media-id="279317228" src="https://c10.patreonusercontent.com/4...">
    const imgMediaIDs = $('img').toArray().reduce<Array<{ id: string, src?: string }>>((result, el) => {
      const id = $(el).attr('data-media-id');
      const src = $(el).attr('src');
      if (id) {
        result.push({id, src});
      }
      return result;
    }, []);
    
    const patreonImages = imgMediaIDs
      .map(({id, src}) => this.findInAPIResponseIncludedArray(included, id, 'media', 'image', src ? {
        id,
        attributes: {
          file_name: FSHelper.sanitizeFilename(`${postId}_${id}${URLHelper.getExtensionFromURL(src)}`),
          media_type: 'image',
          image_urls: {
            original: src
          }
        }
      } : undefined))
      .filter((item) => item !== null) as Downloadable<DefaultImageMediaItem>[];

    // External images support
    const externalImages: Downloadable<DefaultImageMediaItem>[] = [];
    const allImgs = $('img').toArray();
    
    allImgs.forEach((el, index) => {
      const src = $(el).attr('src');
      const mediaId = $(el).attr('data-media-id');
      
      // Process only images without data-media-id (external images)
      if (src && !mediaId) {
                  // Validate URL
        try {
          const url = new URL(src);
          // Support images from any domain (not just Patreon)
          if (url.protocol === 'https:' || url.protocol === 'http:') {
            // Universal filename extraction logic
            let originalFilename = '';
            
            // 1. Extract the last path segment (most common case)
            const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
            if (pathSegments.length > 0) {
              originalFilename = pathSegments[pathSegments.length - 1];
            }
            
            // 2. Remove query parameters
            originalFilename = originalFilename.split('?')[0];
            
            // 3. If filename is suspiciously short or has no extension,
            //    try to find a better candidate in other path segments
            if (originalFilename.length < 5 || !originalFilename.includes('.')) {
              const betterCandidate = pathSegments.find(segment => 
                segment.includes('.') && segment.length > 5 && !segment.includes('v1')
              );
              if (betterCandidate) {
                originalFilename = betterCandidate;
              }
            }
            
            // 4. Fallback: if filename is still invalid
            if (!originalFilename || originalFilename.length < 3 || originalFilename === '/') {
              originalFilename = `external_${postId}_${index}`;
            }
            
            // 5. Add extension if missing
            const hasValidExtension = originalFilename.includes('.') && 
              originalFilename.split('.').pop()!.length >= 2 && 
              originalFilename.split('.').pop()!.length <= 5;
            if (!hasValidExtension) {
              const extension = URLHelper.getExtensionFromURL(src) || '.jpg';
              originalFilename += extension;
            }
            
            // 6. Limit filename length
            if (originalFilename.length > 150) {
              const extension = originalFilename.split('.').pop();
              const nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
              originalFilename = nameWithoutExt.substring(0, 140 - index.toString().length) + `_${index}.${extension}`;
            }
            
            const externalId = `external_${postId}_${index}`;
            const filename = FSHelper.sanitizeFilename(originalFilename);
            
                                      const externalImage: Downloadable<DefaultImageMediaItem> = {
               type: 'image',
               id: externalId,
               filename: filename,
               mimeType: null,
               imageType: 'default',
               createdAt: null,
               downloadURL: src,
               imageURLs: {
                 default: src,
                 defaultSmall: null,
                 original: src,
                 thumbnail: null,
                 thumbnailLarge: null,
                 thumbnailSmall: null
               },
               thumbnailURL: null
             };
            
            externalImages.push(externalImage);
            this.log('debug', `Found external image: ${src}`);
          }
        } catch (error) {
          this.log('debug', `Invalid image URL: ${src}`);
        }
      }
    });

    const allImages = [...patreonImages, ...externalImages];
    this.log('debug', `Parse inline media - got ${patreonImages.length} Patreon images + ${externalImages.length} external images = ${allImages.length} total`);

    return {
      images: allImages
    };
  }

  protected parseCollectionNextURL(json: any, _url: string) {
    const nextURL = ObjectHelper.getProperty(json, 'links.next') || null;
    const nextPageCursor = ObjectHelper.getProperty(json, 'meta.pagination.cursors.next');
    let realNextURL = null;
    if (nextURL && nextPageCursor) {
      const urlObj = new URL(nextURL);
      urlObj.searchParams.set('page[cursor]', nextPageCursor);
      realNextURL = urlObj.toString();
    }
    if (nextURL && !nextPageCursor) {
      this.log('warn', `Anomaly in API response of "${_url}: (pagination) next page cursor expected but missing`);
    }
    return realNextURL;
  }

  protected log(level: LogLevel, ...msg: Array<any>) {
    commonLog(this.#logger, level, this.name, ...msg);
  }
}
