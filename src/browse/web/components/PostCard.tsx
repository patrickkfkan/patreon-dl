import { type Downloadable, type Post } from "../../../entities";
import sanitize from "sanitize-html";
import { Card, Stack } from "react-bootstrap";
import MediaGrid from "./MediaGrid";
import path from "path";
import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import MediaImage from "./MediaImage";

interface PostCardProps {
  post: Post
  showCampaign?: boolean;
}

function PostCard(props: PostCardProps) {
  const { post, showCampaign = false } = props;
  const location = useLocation();

  const mediaItems: Downloadable<any> = [];
  if (post.video) {
    mediaItems.push(post.video);
  }
  else if (post.embed) {
    mediaItems.push(post.embed);
  }
  else if (post.videoPreview) {
    mediaItems.push(post.videoPreview);
  }
  else {
    mediaItems.push(...post.images);
  }

  const attachments = useMemo(() => {
    const links = post.attachments.reduce<{title: string; url: string}[]>((result, att) => {
      if (att.downloaded?.path) {
        const title = att.filename || path.parse(att.downloaded.path).base;
        result.push({
          title,
          url: `/media/${att.id}`
        });
      }
      return result;
    }, []);
    if (links.length > 0) {
      return (
        <div>
          <p>Attachments:</p>
          <ul>
            {
              links.map(({title, url}) => (
                <li>
                  <a href={url}>{title}</a>
                </li>
              ))
            }
          </ul>
        </div>
      )
    }
  }, [post]);

  const audio = useMemo(() => {
    const audio =
      post.audio?.downloaded?.path ? post.audio
      : post.audioPreview?.downloaded?.path ? post.audioPreview
      : null;
    if (!audio) {
      return null;
    }
    return (
      <div className="my-4">
        <audio controls className="w-100 rounded">
          <source src={`/media/${audio.id}`} type={audio.downloaded?.mimeType || ''} />
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }, [post]);

  const titleEl = useMemo(() => {
    const url = new URL(`/posts/${post.id}`, window.location.href);
    if (location.pathname === url.pathname) {
      return post.title;
    }
    return (
      <Link to={url.toString()}>{post.title}</Link>
    )
  }, [post, location]);
  
  return (
    <Card className="overflow-hidden">
      {
        showCampaign && post.campaign && post.campaign.name ? (
          <Card.Header>
            <Stack direction="horizontal" gap={3}>
              <MediaImage
                mediaId={`campaign:${post.campaign.id}:avatar`}
                className="rounded"
                style={{ width: '2.5em', height: '2.5em', objectFit: 'cover'}} />
              <span>
                <Link to={`/campaigns/${post.campaign.id}`}
                  className="text-body"
                >
                  {post.campaign.name}
                </Link>
              </span>
            </Stack>
          </Card.Header>
        ) : null
      }
      <MediaGrid items={mediaItems} title={post.title || ''} />
      <Card.Body>
        <Stack>
          <Stack direction="horizontal" className="mb-3 justify-content-between gap-4">
            <Card.Title className="m-0">{titleEl}</Card.Title>
            {
              !post.isViewable ? (
                <span className="material-icons text-body-secondary">lock</span>
              ) : null
            }
          </Stack>
          <Stack direction="horizontal" className="mb-3 text-body-secondary" gap={4}>
            {
              post.publishedAt ? (
                <span>
                  {new Date(post.publishedAt).toLocaleString()}
                </span>
              ) : null
            }
            {
              post.commentCount > 0 ? (
                <Stack direction="horizontal" gap={2}>
                  <span className="material-icons" style={{ fontSize: '1.2em' }}>comment</span>
                  <span>{post.commentCount}</span>
                </Stack>
              ) : null
            }
          </Stack>
          { audio }
          <Card.Text dangerouslySetInnerHTML={{__html: sanitize(post.content || '')}} />
          { attachments }
        </Stack>
      </Card.Body>
    </Card>
  )
}

export default PostCard;