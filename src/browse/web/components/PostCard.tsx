import "../assets/styles/PostCard.scss";
import { type Downloadable, type Post } from "../../../entities";
import { Card, Stack } from "react-bootstrap";
import MediaGrid from "./MediaGrid";
import path from "path";
import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import MediaImage from "./MediaImage";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-video.css";
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import FadeContent from "./FadeContent";

interface PostCardProps {
  post: Post;
  showCampaign?: boolean;
  useShowMore?: boolean;
  contextQS?: string;
}

function PostCard(props: PostCardProps) {
  const { post, showCampaign = false, useShowMore = false, contextQS } = props;
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
  else if (post.images.length > 0) {
    mediaItems.push(...post.images);
  }
  else if (post.coverImage?.downloaded?.path) {
    mediaItems.push(post.coverImage);
  }
  else if (post.thumbnail?.downloaded?.path) {
    mediaItems.push(post.thumbnail);
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
    if (contextQS) {
      url.search = contextQS;
    }
    if (location.pathname === url.pathname) {
      return post.title;
    }
    return (
      <Link to={url.toString()}>{post.title}</Link>
    )
  }, [post, location, contextQS]);

  // If there's an embed but no local video, and it's a known provider (YouTube), show the embed.
  const externalEmbed = useMemo(() => {
    // Only YouTube embeds for now
    // Vimeo can't be reliably embedded due to CORS restrictions
    if (post.embed && !post.embed.downloaded?.path && post.embed.html && post.embed.provider?.toLowerCase() === 'youtube') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.embed.html, 'text/html');
      // Select the iframe and get attributes
      const iframe = doc.querySelector('iframe');
      const width = iframe ? iframe.getAttribute('width') : null;
      const height = iframe ? iframe.getAttribute('height') : null;
      let aspectRatio = '';
      if (width && height) {
        aspectRatio = `${width} / ${height}`;
      }
      const style: React.CSSProperties = {
        width: '100%'
      };
      if (aspectRatio) {
        style.aspectRatio = aspectRatio;
      }
      const caption = post.embed.provider ? `(Embedded from ${post.embed.provider} - not stored locally)` : '(Embedded content - not stored locally)';
      return (
        <div className="post-card__external-embed-wrapper">
          <div
            className="post-card__external-embed"
            style={style}
            dangerouslySetInnerHTML={{__html: post.embed.html}}
          />
          <span className="post-card__external-embed-caption">{caption}</span>
        </div>
      )
    }
    return null;
  }, [post]);

  const inlineMediaRegex = /class=".*?\s*?lightgallery-item.*?\s*?"/gm;
  const hasInlineMedia = inlineMediaRegex.test(post.content || '');
  const hasGallery = mediaItems.length > 0 || hasInlineMedia;

  let body = (
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
      <Card.Text dangerouslySetInnerHTML={{__html: post.content || ''}} />
      { attachments }
    </Stack>
  );

  if (useShowMore) {
    body = (
      <FadeContent>
        {body}
      </FadeContent>
    );
  }

  const contents = (
    <Card className="post-card">
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
      <MediaGrid items={mediaItems} title={post.title || ''} noGallery />
      { externalEmbed }
      <Card.Body>
        {body}
      </Card.Body>
    </Card>
  );

  if (!hasGallery) {
    return contents;
  }
  
  return (
    <LightGallery
      speed={500}
      plugins={[lgThumbnail, lgZoom, lgVideo]}
      videojs
      selector=".lightgallery-item"
    >
      {contents}
    </LightGallery>
  )
}

export default PostCard;