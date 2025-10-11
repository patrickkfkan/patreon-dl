import { type APIConstructor } from ".";
import { type GetMediaListParams, type MediaList, type MediaListSortBy } from "../types/Media.js";
import { type ContentType } from "../types/Content.js";

const DEFAULT_MEDIA_LIST_SIZE = 10;
const DEFAULT_MEDIA_LIST_SORT_BY: MediaListSortBy = 'latest';

export function MediaAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class MediaAPI extends Base {
    getMediaList<T extends ContentType>(params: GetMediaListParams<T>): MediaList<T> {
      const { sortBy = DEFAULT_MEDIA_LIST_SORT_BY, limit = DEFAULT_MEDIA_LIST_SIZE, offset = 0 } = params;
      return this.db.getMediaList({
        ...params,
        sortBy,
        limit,
        offset,
      });
    }
  }
}