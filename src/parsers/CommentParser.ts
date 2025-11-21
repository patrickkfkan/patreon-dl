import { type CommentReplyList, type CommentList } from '../entities/Comment.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import Parser from './Parser.js';
import { type User } from '../entities/User.js';

export default class CommentParser extends Parser {

  protected name = 'CommentParser';

  parseCommentsAPIResponse(json: any, _url: string, replies: true): CommentReplyList;
  parseCommentsAPIResponse(json: any, _url: string, replies?: false): CommentList;
  parseCommentsAPIResponse(json: any, _url: string, replies = false) {

    this.log('debug', `Parse API response of "${_url}"`);

    const includedJSON = json.included;
    const dataJSON = json.data;
    let commentsJSONArray: any[];
    // Check if API data consists of just a single comment (not an array).
    // If so, place the comment data in an array.
    if (dataJSON && !Array.isArray(dataJSON) && dataJSON.type === 'comment') {
      commentsJSONArray = [ dataJSON ];
    }
    // If API data is an array, filter out those matching 'comment' type.
    else if (dataJSON && Array.isArray(dataJSON)) {
      commentsJSONArray = dataJSON.filter((data) => data.type === 'comment');
    }
    else {
      // No comments found
      commentsJSONArray = [];
    }
    const collection = {
      url: _url,
      items: [],
      total: ObjectHelper.getProperty(json, 'meta.pagination.total') || null,
      nextURL: this.parseCollectionNextURL(json, _url)
    };

    let hasIncludedJSON = true;
    if (!includedJSON || !Array.isArray(includedJSON)) {
      this.log('warn', `'included' field missing in API response of "${_url}" or has incorrect type - no commenter info will be returned`);
      hasIncludedJSON = false;
    }

    if (commentsJSONArray.length === 0) {
      this.log('warn', `No comments found in API response of "${_url}"`);
      return collection;
    }
    if (commentsJSONArray.length > 1) {
      this.log('debug', `${commentsJSONArray.length} comments found - iterate and parse`);
    }
    else {
      this.log('debug', '1 comment found - parse');
    }

    for (const commentJSON of commentsJSONArray) {
      if (!commentJSON || typeof commentJSON !== 'object') {
        this.log('error', 'Parse error: API data of comment has incorrect type');
        continue;
      }

      const { id, attributes, relationships = {} } = commentJSON;

      if (!id) {
        this.log('error', 'Parse error: \'id\' field missing in API data of comment');
        continue;
      }

      this.log('debug', `Parse comment #${id}`);

      if (!attributes || typeof attributes !== 'object') {
        this.log('error', `Parse error: 'attributes' field missing in API data of comment #${id} or has incorrect type`);
        continue;
      }

      let commenter: User | null = null;
      if (relationships.commenter?.data?.id && hasIncludedJSON) {
        commenter = this.findInAPIResponseIncludedArray(includedJSON, relationships.commenter.data.id, 'user')
      }

      const commentBase = {
        id,
        type: 'comment' as const,
        body: attributes.body || '',
        commenter,
        createdAt: attributes.created || null,
        isByCreator: attributes.is_by_creator || false
      };

      if (replies) {
        this.log('debug', `Done parsing comment reply #${id}`);
        (collection as CommentReplyList).items.push({ ...commentBase });
      }
      else {
        this.log('debug', `Done parsing comment #${id}`);
        (collection as CommentList).items.push({
          ...commentBase,
          replyCount: attributes.reply_count || 0,
          replies: []
        });
      }
    }

    this.log('debug', 'Done parsing comments');

    return collection;
  }
}
