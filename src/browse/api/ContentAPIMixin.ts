import { load as cheerioLoad } from 'cheerio';
import { type APIConstructor } from ".";
import { type Product, type Post } from "../../entities";
import { type GetContentContext, type ContentListSortBy, type ContentType, type GetContentListParams, type GetCollectionListParams, type CollectionListSortBy } from "../types/Content.js";
import RawDataExtractor from '../web/utils/RawDataExtractor.js';
import { URLHelper } from '../../utils/index.js';

const DEFAULT_CONTENT_LIST_SIZE = 10;
const DEFAULT_CONTENT_LIST_SORT_BY: ContentListSortBy = 'a-z';

const DEFAULT_COLLECTION_LIST_SIZE = 10;
const DEFAULT_COLLECTION_LIST_SORT_BY: CollectionListSortBy = 'a-z';

export function ContentAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class ContentAPI extends Base {
    getContentList<T extends ContentType>(params: GetContentListParams<T>) {
      const { sortBy = DEFAULT_CONTENT_LIST_SORT_BY, limit = DEFAULT_CONTENT_LIST_SIZE, offset = 0 } = params;
      const list = this.db.getContentList({
        ...params,
        sortBy,
        limit,
        offset,
      });
      for (const item of list.items) {
        switch (item.type) {
          case 'post':
            this.#processPostContentInlineMedia(item);
            item.content = this.sanitizeHTML(item.content || '');
            break;
          case 'product': {
            const description = RawDataExtractor.getProductRichTextDescription(item);
            item.description = description ? this.sanitizeHTML(description) : null;
            break;
          }
        }
      }
      return list;
    }

    getPost(id: string) {
      const post = this.db.getContent(id, 'post');
      if (post) {
        this.#processPostContentInlineMedia(post);
        post.content = this.sanitizeHTML(post.content || '');
      }
      return post;
    }

    getProduct(id: string) {
      return this.db.getContent(id, 'product');
    }

    getPreviousNextContent<T extends ContentType>(content: Post | Product, context: GetContentContext<T>) {
      return this.db.getPreviousNextContent(content, context);
    }

    getCollection(id: string) {
      return this.db.getCollection(id);
    }

    getCollectionList(params: GetCollectionListParams) {
      const { sortBy = DEFAULT_COLLECTION_LIST_SORT_BY, limit = DEFAULT_COLLECTION_LIST_SIZE, offset = 0 } = params;
      return this.db.getCollectionList({
        campaign: params.campaign,
        sortBy,
        limit,
        offset
      });
    }

    #processPostContentInlineMedia(post: Post) {
      const html = post.content || '';
      const hasImages = post.images.length > 0;
      const hasLinkedAttachments = post.linkedAttachments && post.linkedAttachments.length > 0;
      if (!html || (!hasImages && !hasLinkedAttachments)) {
        return;
      }

      const $ = cheerioLoad(html);
      const replacedMediaIds: string[] = [];
      let hasModified = false;

      if (hasImages) {
        $('img').each((_, _el) => {
          const el = $(_el);
          const id = el.attr('data-media-id');
          const matched = id ? post.images.find(img => img.id === id && img.downloaded) : null;
          const src = matched ? `/media/${matched.id}` : el.attr('src');
          const imgEl = $('<img>').attr('src', src);
          const aEl = $('<a>')
            .attr('href', src)
            .attr('class', 'lightgallery-item')
            .append(imgEl);
          const wrapperEl = $('<div>')
            .attr('class', 'post-card__inline-media-wrapper')
            .append(aEl);
          if (!matched) {
            const caption = "(Externally hosted - not stored locally)";
            wrapperEl.append(
              $('<span>').attr('class', 'post-card__inline-media-caption').append(caption)
            );
          }
          el.replaceWith(wrapperEl);
          if (id && matched) {
            replacedMediaIds.push(id);
          }
        });
        if (replacedMediaIds.length > 0) {
          hasModified = true;
          // Remove images that have been inlined
          post.images = post.images.filter((img) => !replacedMediaIds.includes(img.id));
        }
      }

      // Linked attachments
      if (hasLinkedAttachments) {
        $('a').each((_, _el) => {
          const aEl = $(_el);
          const href = aEl.attr('href') || '';
          const { validated, ownerId, mediaId } = URLHelper.isAttachmentLink(href);
          if (validated) {
            let modifiedPath: string | undefined;
            if (post.id !== ownerId) {
              const isDownloaded = post.linkedAttachments?.find((att) => att.postId === ownerId && att.mediaId === mediaId)?.downloadable?.downloaded;
              modifiedPath = isDownloaded && `/media/${mediaId}?lapid=${post.id}`;
            }
            else {
              const isDownloaded = post.attachments.find((att) => att.id === mediaId)?.downloaded;
              modifiedPath = isDownloaded && `/media/${mediaId}`;
            }
            if (modifiedPath) {
              aEl.attr('href', modifiedPath);
              hasModified = true;
            }
          }
        });
      }

      if (hasModified) {
        post.content = $.html();
      }
    }
  }
}