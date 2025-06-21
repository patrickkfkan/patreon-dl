import { type Comment, type CommentReply } from "../../../entities/Comment";
import { Stack, Badge } from "react-bootstrap";

interface CommentRowProps {
  comment: Comment | CommentReply;
}

function hasReplies(comment: Comment | CommentReply): comment is Comment {
  return Reflect.has(comment, 'replies');
}

function CommentRow(props: CommentRowProps) {
  const { comment } = props;
  return (
    <Stack>
      <Stack direction="horizontal" className="mb-2" gap={3}>
        <div>
          <span className="fw-bolder me-2">{comment.commenter?.fullName || ''}</span>
          {comment.isByCreator ? <Badge bg="secondary">CREATOR</Badge> : null}
        </div>
        <span className="text-body-secondary">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
        </span>
      </Stack>
      <div>
        {comment.body}
      </div>
      {
        hasReplies(comment) && comment.replies.length > 0 ? (
          <div className="border-start border-secondary mt-2 mb-1 pt-3 pb-2" style={{paddingLeft: '1em'}}>
            <CommentsPanel comments={comment.replies} />
          </div>
        )
        : null
      }
    </Stack>
  )
}

function CommentsPanel(props: { comments: (Comment | CommentReply)[] }) {
  const { comments } = props;
  if (comments.length === 0) {
    return null;
  }
  const rows = comments.map((comment) => <CommentRow comment={comment} />);
  return (
    <Stack gap={4}>
      {rows}
    </Stack>
  )
}

export default CommentsPanel;