import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Container, Row, Col } from "react-bootstrap";
import { useAPI } from "../contexts/APIProvider";
import PostCard from "../components/PostCard";
import CommentsPanel from "../components/CommentsPanel";
import { type PostWithComments } from "../../types/Content";

function PostContent() {
  const {id: postId} = useParams();
  const { api } = useAPI();
  const [post, setContent] = useState<PostWithComments | null>(null);

  useEffect(() => {
    if (!postId) {
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const post = await api.getPost(postId);
      if (!abortController.signal.aborted) {
        setContent(post);
      }
    })();

    return () => abortController.abort();
  }, [api, postId]);

  if (!post) {
    return null;
  }

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col lg={8} md={10} sm={12} className="p-0" style={{maxWidth: '40.5em'}}>
          <div className="my-4">
            <PostCard post={post} showCampaign />
            {
              post.comments ? (
                <div className="mt-4">
                  <h5 className="mb-3">{post.commentCount} {post.comments.length > 1 ? 'comments' : 'comment'}</h5>
                  <CommentsPanel comments={post.comments} />
                </div>
              ) : null
            }
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default PostContent;