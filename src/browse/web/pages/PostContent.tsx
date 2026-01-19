import "../assets/styles/PostContent.scss";
import { forwardRef, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { NavLink, useParams } from "react-router";
import { Container, Row, Col, Stack } from "react-bootstrap";
import { useAPI } from "../contexts/APIProvider";
import PostCard from "../components/PostCard";
import CommentsPanel from "../components/CommentsPanel";
import { type PostWithComments } from "../../types/Content";
import { type PostFilterSearchParams } from "../../types/Filter";
import { type UnionToTuple } from "../../../utils/Misc";
import { useScroll } from "../contexts/MainContentScrollProvider";

interface PostNav {
  previous: PostWithComments | null;
  next: PostWithComments | null;
}

const CONTEXT_QS_PARAMS: UnionToTuple<PostFilterSearchParams | 'collection_id'> = [
  'post_types',
  'is_viewable',
  'tier_ids',
  'collection_id',
  'sort_by',
  'date_published',
  'search',
  'tag_id'
];

function getContextQS() {
  const searchParams = new URL(window.location.href).searchParams;
  const result = new URLSearchParams();
  for (const param of CONTEXT_QS_PARAMS) {
    if (searchParams.has(param)) {
      result.set(param, searchParams.get(param) as string);
    }
  }
  return result.toString();
}

const contentReducer = (currentContent: PostWithComments | null, newContent: PostWithComments | null) => {
  if (currentContent && newContent) {
    return currentContent.id === newContent.id ? currentContent : newContent;
  }
  return newContent;
}

const ContentColumn = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>
>(({children, ...props}, ref) => {
  return (
    <Container fluid ref={ref} {...props}>
      <Row className="justify-content-center">
        <Col lg={8} md={10} sm={12} className="p-0" style={{maxWidth: '40.5em'}}>
          {children}
        </Col>
      </Row>
    </Container>
  );
});

function PostContent() {
  const {id: postId} = useParams();
  const { api } = useAPI();
  const { scrollTo } = useScroll();
  const [post, setContent] = useReducer(contentReducer, null);;
  const [postNav, setPostNav] = useState<PostNav>({ previous: null, next: null });
  const contentRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [stickyNav, setStickyNav] = useState(false);

  useEffect(() => {
    if (!postId) {
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const { post, previous, next } = await api.getPost(postId, getContextQS());
      if (!abortController.signal.aborted) {
        setContent(post);
        setPostNav({ previous, next });
      }
    })();

    return () => abortController.abort();
  }, [api, postId]);

  const updateNavStickiness = useCallback(() => {
    if (!postNav.previous && !postNav.next) {
      return;
    }
    let h = 72;  // Assumed nav height
    const viewportHeight = window.innerHeight;
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      h += rect.bottom;
    }
    if (commentsRef.current) {
      h += commentsRef.current.scrollHeight;
    }
    setStickyNav(h > viewportHeight);
  }, [postNav, postId]);

  useEffect(() => {
    updateNavStickiness();
    window.addEventListener("resize", updateNavStickiness);

    return () => window.removeEventListener("resize", updateNavStickiness);
  }, [updateNavStickiness]);

  const nav = useMemo(() => {
    const { previous, next } = postNav;
    const contextQS = getContextQS();
    const previousLink = previous ? (
      <NavLink
        to={`/posts/${previous.id}${contextQS ? '?' + contextQS : ''}`}
        className={`post-nav__previous ${ !next ? 'post-nav__previous--fill' : ''}`}
        onClick={() => {
          setPostNav({ previous: null, next: null });
          scrollTo(0, 0);
          setContent(previous);
        }}
      >
        <div className="post-nav__previous-label">{previous.title}</div>
      </NavLink>
    ) : null;
    const nextLink = next ? (
      <NavLink
        to={`/posts/${next.id}${contextQS ? '?' + contextQS : ''}`}
        className={`post-nav__next ${ !previous ? 'post-nav__next--fill' : ''}`}
        onClick={() => {
          setPostNav({ previous: null, next: null });
          scrollTo(0, 0);
          setContent(next);
        }}
      >
        <div className="post-nav__next-label">{next.title}</div>
      </NavLink>
    ) : null;
    if (previousLink || nextLink) {
      const justify = 
        previous && next ? 'justify-content-between'
        : next ? 'justify-content-end'
        : '';
      const fixed = stickyNav ? 'fixed' : '';
      return (
        <ContentColumn ref={navRef} className={`post-nav__wrapper ${fixed}`}>
          <Stack direction="horizontal" className={`post-nav mt-2 mb-3 ${justify}`}>
            { previousLink }
            { nextLink }
          </Stack>
        </ContentColumn>
      );
    }
    return null;
  }, [postNav, scrollTo, stickyNav]);

  if (!post) {
    return null;
  }

  return (
    <>
      <ContentColumn ref={contentRef}>
        <div className={!nav || stickyNav ? 'py-4' : 'pt-4'}>
          <PostCard post={post} showCampaign />
        </div>
      </ContentColumn>
      { !stickyNav && nav }
      {
        post.comments && (
          <ContentColumn ref={commentsRef} className="pt-2 pb-4 px-4">
            <h5 className="mb-3">{post.commentCount} {post.comments.length > 1 ? 'comments' : 'comment'}</h5>
            <CommentsPanel comments={post.comments} />
          </ContentColumn>
        )
      }
      { stickyNav && nav }
    </>
  )
}

export default PostContent;