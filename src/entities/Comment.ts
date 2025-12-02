import { type List } from "./List.js";
import { type User } from "./User.js";

export type CommentList = List<Comment>;
export type CommentReplyList = List<CommentReply>;

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
