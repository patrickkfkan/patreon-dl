import { EOL } from 'os';
import { type Comment, type CommentReply } from '../../entities/Comment.js';

const POST_COMMENT_TEMPLATE =
  `
{comment.commenter} {comment.date}
{---}
{comment.body}

`;

export function generatePostCommentsSummary(comments: Comment[] | CommentReply[], indent = '') {
  let result = '';
  for (const comment of comments) {
    const snippet = POST_COMMENT_TEMPLATE
      .replaceAll('{comment.commenter}', comment.commenter?.fullName || '')
      .replaceAll('{comment.date}', comment.createdAt || '')
      .replaceAll('{comment.body}', comment.body);

    const lines = snippet.split(EOL);
    const formatted = lines.map((l, i) => {
      let fl = l;
      if (l.includes('{---}') && i > 0) {
        const previousLine = lines[i - 1];
        if (previousLine) {
          const sep = '-'.repeat(previousLine.length);
          fl = l.replaceAll('{---}', sep);
        }
      }
      return `${indent}${fl}`;
    })
    .join(EOL);

    result += formatted;

    if (isComment(comment) && comment.replies.length > 0) {
      result += generatePostCommentsSummary(comment.replies, '    ');
    }
  }
  return result;
}

function isComment(data: Comment | CommentReply): data is Comment {
  return Reflect.has(data, 'replies');
}
