import { Campaign } from '../entities/Campaign.js';
import { Downloadable } from '../entities/Downloadable.js';
import { MediaItem, PostCoverImageMediaItem, PostThumbnailMediaItem, VideoMediaItem } from '../entities/MediaItem.js';
import { Post, PostCollection, PostEmbed } from '../entities/Post.js';
import { pickDefined } from '../utils/Misc.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import Parser from './Parser.js';

export default class PostParser extends Parser {

  protected name = 'PostParser';

  parsePostsAPIResponse(json: any, _url: string): PostCollection {

    this.log('debug', `Parse API response of "${_url}"`);

    /*If (json.errors) {
      this.log('error', `API response error:`, json.errors);
      return null;
    }*/

    const includedJSON = json.included;
    const dataJSON = json.data;
    let postsJSONArray: any[];
    // Check if API data consists of just a single post (not an array).
    // If so, place the post data in an array.
    if (dataJSON && !Array.isArray(dataJSON) && dataJSON.type === 'post') {
      postsJSONArray = [ dataJSON ];
    }
    // If API data is an array, filter out those matching 'post' type.
    else if (dataJSON && Array.isArray(dataJSON)) {
      postsJSONArray = dataJSON.filter((data) => data.type === 'post');
    }
    else {
      // No posts found
      postsJSONArray = [];
    }

    const nextURL = ObjectHelper.getProperty(json, 'links.next') || null;
    const nextPageCursor = ObjectHelper.getProperty(json, 'meta.pagination.cursors.next');
    let realNextURL: string | null = null;
    if (nextURL && nextPageCursor) {
      const urlObj = new URL(nextURL);
      urlObj.searchParams.set('page[cursor]', nextPageCursor);
      realNextURL = urlObj.toString();
    }
    if (nextURL && !nextPageCursor) {
      this.log('warn', `Anomaly in API response of "${_url}: (pagination) next page cursor expected but missing`);
    }
    const collection: PostCollection = {
      url: _url,
      posts: [],
      total: ObjectHelper.getProperty(json, 'meta.pagination.total') || null,
      nextURL: realNextURL
    };

    let hasIncludedJSON = true;
    if (!includedJSON || !Array.isArray(includedJSON)) {
      this.log('warn', `'included' field missing in API response of "${_url}" or has incorrect type - no media items and campaign info will be returned`);
      hasIncludedJSON = false;
    }

    if (postsJSONArray.length === 0) {
      this.log('warn', `No posts found in API response of "${_url}"`);
      return collection;
    }
    if (postsJSONArray.length > 1) {
      this.log('debug', `${postsJSONArray.length} posts found - iterate and parse`);
    }
    else {
      this.log('debug', '1 post found - parse');
    }

    let campaign: Campaign | null | undefined;

    for (const postJSON of postsJSONArray) {
      if (!postJSON || typeof postJSON !== 'object') {
        this.log('error', 'Parse error: API data of post has incorrect type');
        continue;
      }

      const { id, attributes, relationships = {} } = postJSON;

      if (!id) {
        this.log('error', 'Parse error: \'id\' field missing in API data of post');
        continue;
      }

      this.log('debug', `Parse post #${id}`);

      if (!attributes || typeof attributes !== 'object') {
        this.log('error', `Parse error: 'attributes' field missing in API data of post #${id} or has incorrect type`);
        continue;
      }

      // Campaign info
      if (campaign === undefined) {
        const campaignId = ObjectHelper.getProperty(postJSON, 'relationships.campaign.data.id') || null;
        if (!campaignId || typeof campaignId !== 'string') {
          this.log('warn', `Campaign ID missing in API data of post #${id} or has incorrect type` +
            ' - no campaign info will be available until campaign ID is obtained');
        }
        else if (hasIncludedJSON) {
          campaign = this.findInAPIResponseIncludedArray(includedJSON, campaignId, 'campaign');
        }
      }

      // Viewability
      const isViewable = pickDefined(attributes.current_user_can_view, true);
      if (attributes.current_user_can_view === undefined) {
        this.log('warn', `'current_user_can_view' attribute missing in API data of post #${id} - assuming post is viewable`);
      }

      // Get downloadables from relationships
      let audio: Downloadable | null = null;
      let audioPreview: Downloadable | null = null;
      let images: Downloadable[] = [];
      let attachments: Downloadable[] = [];
      if (hasIncludedJSON) {
        const downloadables = this.fetchDownloadablesFromRelationships(
          relationships,
          {
            'audio': 'audio items',
            'audio_preview': 'audio preview items',
            'images': 'images',
            'attachments': 'attachments'
          },
          includedJSON,
          `post #${id}`,
          false
        );
        audio = downloadables.audio?.[0] || null;
        audioPreview = downloadables.audio_preview?.[0] || null;
        images = downloadables.images || [];
        attachments = downloadables.attachments || [];
      }

      const __getVideoMediaItemFromAttr = (attrJSON: any): VideoMediaItem => {
        let miFromIncluded: MediaItem | null = null;
        const _mediaId = attrJSON.media_id !== undefined ? attrJSON.media_id.toString() : null;
        if (_mediaId && hasIncludedJSON) {
          // Fetch item from 'included' array, matching `media_id`
          miFromIncluded = this.findInAPIResponseIncludedArray(includedJSON, _mediaId, 'media', 'video');
        }
        const vidInc = miFromIncluded && miFromIncluded.type === 'video' ? miFromIncluded : null;
        const mediaId = _mediaId || id; // Fallback to post ID

        const { download_url: downloadURL = null, url: displayURL = null } = attrJSON;

        // Convert `attrJSON` to Downloadable (VideoMediaItem)
        return {
          type: 'video',
          id: mediaId,
          filename: vidInc?.filename || null,
          mimeType: vidInc?.mimeType || null,
          createdAt: vidInc?.createdAt || null,
          size: {
            width: attrJSON.width || vidInc?.size.width,
            height: attrJSON.height || vidInc?.size.height
          },
          duration: attrJSON.duration || vidInc?.duration,
          downloadURL: downloadURL || vidInc?.downloadURL,
          displayURLs: {
            thumbnail: vidInc?.displayURLs.thumbnail || null,
            video: displayURL || vidInc?.downloadURL
          }
        };
      };

      // Video preview
      let videoPreview: Downloadable | null = null;
      const vidPreviewJSON = attributes.video_preview;
      if (vidPreviewJSON && typeof vidPreviewJSON === 'object') {
        videoPreview = __getVideoMediaItemFromAttr(vidPreviewJSON);
        if (!videoPreview.downloadURL && !videoPreview.displayURLs.video) {
          this.log('warn', `Video preview for post #${id} is missing URLs`);
        }
      }

      // Video - `postType` is 'video_external_file' and has `postFile`
      let video: Downloadable | null = null;
      const postFileJSON = attributes.post_file;
      const hasPostFile = postFileJSON && typeof postFileJSON === 'object';
      if (attributes.post_type === 'video_external_file' && hasPostFile) {
        video = __getVideoMediaItemFromAttr(postFileJSON);
        if (!video.downloadURL && !video.displayURLs.video) {
          this.log('warn', `Video for post #${id} is missing URLs`);
        }
      }

      // Cover image
      let coverImage: PostCoverImageMediaItem | null = null;
      if (attributes.image) {
        coverImage = {
          type: 'image',
          id,
          filename: isViewable ? 'cover-image' : 'cover-image-preview',
          mimeType: null,
          imageType: 'postCoverImage',
          imageURLs: {
            large: ObjectHelper.getProperty(attributes, 'image.large_url') || null,
            thumbSquareLarge: ObjectHelper.getProperty(attributes, 'image.thumb_square_large_url') || null,
            thumbSquare: ObjectHelper.getProperty(attributes, 'image.thumb_square_url') || null,
            thumb: ObjectHelper.getProperty(attributes, 'image.thumb_url') || null,
            default: ObjectHelper.getProperty(attributes, 'image.url') || null
          }
        };
      }

      // Thumbnail
      let thumbnail: PostThumbnailMediaItem | null = null;
      if (attributes.thumbnail) {
        thumbnail = {
          type: 'image',
          id,
          filename: isViewable ? 'thumbnail' : 'thumbnail-preview',
          mimeType: null,
          imageType: 'postThumbnail',
          imageURLs: {
            large: ObjectHelper.getProperty(attributes, 'thumbnail.large') || null,
            large2: ObjectHelper.getProperty(attributes, 'thumbnail.large_2') || null,
            square: ObjectHelper.getProperty(attributes, 'thumbnail.square') || null,
            default: ObjectHelper.getProperty(attributes, 'thumbnail.url') || null
          }
        };
      }

      // Embed
      const embedJSON = attributes.embed;
      let embed: PostEmbed | null = null;
      if (embedJSON && typeof embedJSON === 'object') {
        let embedType: PostEmbed['type'];
        switch (attributes.post_type) {
          case 'video_embed':
            embedType = 'videoEmbed';
            break;
          case 'link':
            embedType = 'linkEmbed';
            break;
          default:
            embedType = 'unknownEmbed';
        }
        embed = {
          id: `${id}-embed`,
          type: embedType,
          description: embedJSON.descripton || null,
          html: embedJSON.html || null,
          provider: embedJSON.provider || null,
          providerURL: embedJSON.provider_url || null,
          subject: embedJSON.subject || null,
          url: embedJSON.url || null
        };
      }

      const post: Post = {
        id,
        type: 'post',
        postType: attributes.post_type || null,
        isViewable,
        url: attributes.url || null,
        title: attributes.title || null,
        content: attributes.content || null,
        teaserText: attributes.teaser_text || null,
        publishedAt: attributes.published_at || null,
        editedAt: attributes.edited_at || null,
        coverImage,
        thumbnail,
        embed,
        attachments,
        audio,
        audioPreview,
        images,
        videoPreview,
        video,
        campaign: null,
        raw: json
      };

      this.log('debug', `Done parsing post #${id}`);

      collection.posts.push(post);
    }

    if (campaign) {
      this.log('debug', `Campaign #${campaign.id} found while parsing posts`);
      for (const post of collection.posts) {
        post.campaign = campaign;
      }
    }
    else {
      this.log('warn', 'No campaign info found while parsing posts');
    }

    this.log('debug', 'Done parsing posts');

    return collection;
  }
}
