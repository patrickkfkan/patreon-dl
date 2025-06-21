import "../assets/styles/LightGalleryItem.scss";
import { Badge, Card } from "react-bootstrap";

export interface LightGalleryItemProps {
  id: string;
  href?: string;
  dataSrc?: string;
  dataVideo?: string;
  dataPoster?: string;
  dataIframe?: boolean;
  dataSubHTML?: string;
  thumbnailURL?: string;
  classNamePrefix: string;
  style?: React.CSSProperties;
  badge?: string;
}

function LightGalleryItem(props: LightGalleryItemProps) {
  const {
    href,
    dataSrc,
    dataVideo,
    dataPoster,
    dataIframe,
    dataSubHTML,
    thumbnailURL,
    classNamePrefix,
    style,
    badge
  } = props;
  let extraClassName = dataVideo ? `${classNamePrefix}__thumbnail-wrapper--video` : '';
  if (!thumbnailURL) {
    extraClassName += ` ${classNamePrefix}__thumbnail-wrapper--empty`;
  }
  return (
    <a
      href={href}
      className={`lightgallery-item ${classNamePrefix}__thumbnail-wrapper ${extraClassName}`}
      data-src={dataSrc}
      data-video={dataVideo}
      data-poster={dataPoster}
      data-iframe={dataIframe || undefined}
      data-sub-html={dataSubHTML}
      style={style}
    > {
        thumbnailURL ? (
          <img
            src={thumbnailURL}
            className={`${classNamePrefix}__thumbnail`}
          />
        )
        : (
          <Card className="w-100 h-100 d-flex align-items-center justify-content-center">
            <span className="material-icons-outlined text-secondary" style={{fontSize: '5em'}}>description</span>
          </Card>
        )
      }
      {
        badge ? (
          <Badge className="light-gallery-item__badge" bg="secondary">
            {badge}
          </Badge>
        ) : null
      }
    </a>
  )
}

export default LightGalleryItem;