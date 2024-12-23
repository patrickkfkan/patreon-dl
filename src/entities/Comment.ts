import { Collection } from "./Collection.js";
import { User } from "./User.js";

export type CommentCollection = Collection<Comment>;
export type CommentReplyCollection = Collection<CommentReply>;

export interface Comment {
  type: 'comment';
  id: string;
  body: string;
  commenter: User | null;
  createdAt: string | null;
  isByCreator: boolean;
  replyCount: number;
  replies: Array<CommentReply>;
}

export type CommentReply = Omit<Comment, 'replyCount' | 'replies'>;
