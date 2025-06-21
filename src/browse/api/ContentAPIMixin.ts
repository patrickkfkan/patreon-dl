import { type APIConstructor } from ".";
import { type ContentListSortBy, type ContentType, type GetContentListParams } from "../types/Content.js";

const DEFAULT_CONTENT_LIST_SIZE = 10;
const DEFAULT_CONTENT_LIST_SORT_BY: ContentListSortBy = 'a-z';

export function ContentAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class ContentAPI extends Base {
    getContentList<T extends ContentType>(params: GetContentListParams<T>) {
      const { sortBy = DEFAULT_CONTENT_LIST_SORT_BY, limit = DEFAULT_CONTENT_LIST_SIZE, offset = 0 } = params;
      return this.db.getContentList({
        ...params,
        sortBy,
        limit,
        offset,
      });
    }

    getPost(id: string) {
      return this.db.getContent(id, 'post');
    }

    getProduct(id: string) {
      return this.db.getContent(id, 'product');
    }
  }
}