import "../assets/styles/ProductCard.scss";
import { type Downloadable, type Product } from "../../../entities";
import { Card, Col, Nav, Row, Stack, Tab } from "react-bootstrap";
import { useCallback, useMemo } from "react";
import MediaGrid from "./MediaGrid";
import MediaGallery from "./MediaGallery";
import { type MediaListItem } from "../../types/Media";
import { Link, useLocation } from "react-router";
import ObjectHelper from "../../../utils/ObjectHelper";
import path from "path";
import MediaImage from "./MediaImage";
import { ProductType } from "../../../entities/Product";

interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'full';
  showCampaign?: boolean;
}

const DISPLAYABLE_MEDIA_TYPES = ['image', 'video', 'videoEmbed', 'audio'];

const isDisplayable = (mi: Downloadable) =>
  mi.downloaded?.path &&
(DISPLAYABLE_MEDIA_TYPES.includes(mi.type) || mi.downloaded?.mimeType?.toLowerCase() === 'application/pdf');

function getDisplayableMedia(mediaItems: Downloadable[]) {
  return mediaItems.filter((mi) => isDisplayable(mi));
}

function getNonDisplayableMedia(mediaItems: Downloadable[]) {
  return mediaItems.filter((mi) => !isDisplayable(mi));
}

function convertToMediaListItems(mi: Downloadable[], product: Product) {
  return mi.reduce<MediaListItem<any>[]>((result, mi) => {
    const mediaType =
      mi.type === 'image' ? 'image'
        : mi.type === 'audio' ? 'audio'
          : ['video', 'videoEmbed'].includes(mi.type) ? 'video'
          : mi.downloaded?.mimeType === 'application/pdf' ? 'pdf'
            : null;
    const thumbnail =
      mi.downloaded?.thumbnail?.path ?
        {
          path: mi.downloaded.thumbnail.path,
          width: mi.downloaded.thumbnail.width ?? null,
          height: mi.downloaded.thumbnail.height ?? null
        }
        : null;
    if (mediaType) {
      result.push({
        id: mi.id,
        mediaType,
        mimeType: mi.downloaded?.mimeType || null,
        source: product,
        thumbnail
      });
    }
    return result;
  }, []);
}

function ProductCard(props: ProductCardProps) {
  const { product, variant = 'full', showCampaign = false } = props;
  const location = useLocation();

  const displayableMedia = useMemo(() => ({
    content: getDisplayableMedia(product.contentMedia),
    preview: getDisplayableMedia(product.previewMedia)
  }), [product]);

  const files = useMemo(() => ({
    content: getNonDisplayableMedia(product.contentMedia),
    preview: getNonDisplayableMedia(product.previewMedia)
  }), [product])

  const coverImage = useMemo(() => {
    return displayableMedia.preview.find((mi) => mi.type === 'image') || null;
  }, [displayableMedia]);

  const coverImageEl = useMemo(() => {
    return coverImage ?
      <MediaGrid items={[coverImage]} title={product.name || ''} />
      : null;
  }, [coverImage, product]);

  const getFileLinksEl = useCallback((files: Downloadable[]) => {
    const links = files.reduce<{title: string; url: string}[]>((result, file) => {
      if (file.downloaded?.path) {
        const title = ObjectHelper.getProperty(file, 'filename') || path.parse(file.downloaded.path).base;
        result.push({
          title,
          url: `/media/${file.id}`
        });
      }
      return result;
    }, []);
    return links.length > 0 ? (
      <div>
        <p>Files:</p>
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
    ) : null;
  }, [])

  const previewMediaEl = useMemo(() => {
    if (variant === 'compact') {
      return null;
    }
    const media =
      !coverImage ? [...displayableMedia.preview]
        : displayableMedia.preview.filter((mi) => mi.id !== coverImage.id);
    const galleryEl = media.length > 0 ? <MediaGallery items={convertToMediaListItems(media, product)} /> : null;
    const filesEl = getFileLinksEl(files.preview);
    if (galleryEl || filesEl) {
      return (
        <Stack gap={3}>
          {galleryEl}
          {filesEl}
        </Stack>
      )
    }
    return null;
  }, [product, variant, displayableMedia, coverImage, files, getFileLinksEl]);

  const contentMediaEl = useMemo(() => {
    if (variant === 'compact') {
      return null;
    }
    const galleryEl = displayableMedia.content.length > 0 ?
      <MediaGallery items={convertToMediaListItems(displayableMedia.content, product)} />
      : null;
    const filesEl = getFileLinksEl(files.content);
    if (galleryEl || filesEl) {
      return (
        <Stack gap={3}>
          {galleryEl}
          {filesEl}
        </Stack>
      )
    }
    return null;
  }, [product, variant, displayableMedia, files, getFileLinksEl]);

  const mediaViewEl = useMemo(() => {
    let el: React.ReactElement | null = null;
    if (previewMediaEl && contentMediaEl) {
      el = (
        <Tab.Container defaultActiveKey="purchased">
          <Row className="m-0 mb-4">
            <Col className="p-0">
              <Nav className="product-card__media-nav">
                <Nav.Item>
                  <Nav.Link className="product-card__media-nav-link" eventKey="purchased">Purchased media</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="product-card__media-nav-link" eventKey="preview">Preview media</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
          <Row>
            <Tab.Content className="py-0 m-0 border-0">
              <Tab.Pane eventKey="purchased">
                {contentMediaEl}
              </Tab.Pane>
              <Tab.Pane eventKey="preview">
                {previewMediaEl}
              </Tab.Pane>
            </Tab.Content>
          </Row>
        </Tab.Container>
      )
    }
    else {
      el = contentMediaEl || previewMediaEl;
    }
    return el ? (
      <div className="mt-4">
        {el}
      </div>
    ) : null;
  }, [previewMediaEl, contentMediaEl]);

  const campaignEl = useMemo(() => {
    if (!showCampaign || !product.campaign || !product.campaign.name) {
      return null;
    }
    return (
      <Card.Header>
        <Stack direction="horizontal" gap={3}>
          <MediaImage
            mediaId={`campaign:${product.campaign.id}:avatar`}
            className="rounded"
            style={{ width: '2.5em', height: '2.5em', objectFit: 'cover'}} />
          <span>
            <Link to={`/campaigns/${product.campaign.id}`}
              className="text-body"
            >
              {product.campaign.name}
            </Link>
          </span>
        </Stack>
      </Card.Header>
    )
  }, [product, showCampaign]);

  const titleEl = useMemo(() => {
    let url: URL;
    if (product.productType === ProductType.Post && product.referencedEntityId) {
      url = new URL(`/posts/${product.referencedEntityId}`, window.location.href);
    }
    else if (product.productType === ProductType.Collection && product.referencedEntityId) {
      url = new URL(`/collections/${product.referencedEntityId}`, window.location.href);
    }
    else {
      url = new URL(`/products/${product.id}`, window.location.href);
    }
    if (location.pathname === url.pathname) {
      return product.name;
    }
    return (
      <Link to={url.toString()}>{product.name}</Link>
    )
  }, [product, location]);

  return (
    <Card className={`product-card product-card--${variant}`}>
      {campaignEl}
      {coverImageEl}
      <Card.Body className="d-flex flex-column">
        <Stack>
          <Stack direction="horizontal" className="mb-3 justify-content-between gap-4">
            <Card.Title className="m-0 product-card__title">
              {titleEl}
            </Card.Title>
            {
              !product.isAccessible ? (
                <span className="material-icons text-body-secondary">lock</span>
              ) : null
            }
          </Stack>
          <Stack direction="horizontal" className="mb-3 text-body-secondary justify-content-between" gap={4}>
            {
              product.publishedAt ? (
                <span>
                  {new Date(product.publishedAt).toLocaleString()}
                </span>
              ) : null
            }
            {
              product.price ? (
                <span>{product.price}</span>
              ) : null
            }
          </Stack>
          <Card.Text
            className="product-card__description"
            dangerouslySetInnerHTML={{ __html: product.description || '' }}
          />
        </Stack>
        {mediaViewEl}
      </Card.Body>
    </Card>
  )
}

export default ProductCard;