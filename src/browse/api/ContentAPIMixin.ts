import { load as cheerioLoad } from 'cheerio';
import { type APIConstructor } from ".";
import { type Post } from "../../entities";
import { type ContentListSortBy, type ContentType, type GetContentListParams } from "../types/Content.js";
import RawDataExtractor from '../web/utils/RawDataExtractor.js';

const DEFAULT_CONTENT_LIST_SIZE = 10;
const DEFAULT_CONTENT_LIST_SORT_BY: ContentListSortBy = 'a-z';

export function ContentAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class ContentAPI extends Base {
    async getContentList<T extends ContentType>(params: GetContentListParams<T>) {
      const { sortBy = DEFAULT_CONTENT_LIST_SORT_BY, limit = DEFAULT_CONTENT_LIST_SIZE, offset = 0 } = params;
      const list = await this.db.getContentList({
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

    async getPost(id: string) {
      const post = await this.db.getContent(id, 'post');
      if (post) {
        this.#processPostContentInlineMedia(post);
        post.content = this.sanitizeHTML(post.content || '');
      }
      return post;
    }

    getProduct(id: string) {
      return this.db.getContent(id, 'product');
    }

    #processPostContentInlineMedia(post: Post) {
      const html = post.content || '';
      if (!html || post.images.length === 0) {
        return;
      }
      const $ = cheerioLoad(html);
      const replacedMediaIds: string[] = [];
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
        post.content = $.html();
        // Remove images that have been inlined
        post.images = post.images.filter((img) => !replacedMediaIds.includes(img.id));
      }
    }
  }
}