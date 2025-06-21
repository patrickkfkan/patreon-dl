import { useEffect, useMemo, useRef, useState } from "react";
import { type MediaListItem } from "../../types/Media";
import "../assets/styles/MediaGallery.scss";
import LightGallery from 'lightgallery/react';
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-video.css";
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import LightGalleryItem, { type LightGalleryItemProps } from "./LightGalleryItem";

interface MediaGalleryProps {
  items: MediaListItem<any>[];
}

const ROW_HEIGHT = 160;
const BORDER_WIDTH = 0;
const GAP = 8;

type MediaGalleryItemProps =
  Omit<LightGalleryItemProps, 'classNamePrefix' | 'style'> &
  {
    fixed: boolean;
  };

function MediaGalleryItem(props: MediaGalleryItemProps) {
  const { fixed } = props;
  return (
    <LightGalleryItem
      {...props}
      classNamePrefix="media-gallery"
      style={{
        flexGrow: fixed ? '0' : undefined
      }}
    />
  )
}

function MediaGallery(props: MediaGalleryProps) {
  const { items } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

   useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const lgItemPropsByRow = useMemo(() => {
    if (!containerWidth) {
      return null;
    }
    const rows: Array<MediaListItem<any>[]> = [[]];
    let rowIndex = 0;
    let aggregateWidth = 0;
    const itemsCopy = [...items];
    while (itemsCopy.length > 0) {
      const item = itemsCopy.shift();
      if (!item) {
        continue;
      }
      let itemWidth = 0;
      if (item.thumbnail?.width && item.thumbnail?.height) {
        const scaledWidth = (ROW_HEIGHT / item.thumbnail.height) * item.thumbnail.width;
        itemWidth = BORDER_WIDTH + scaledWidth;
      }
      else {
        itemWidth = BORDER_WIDTH + ROW_HEIGHT;
      }
      let gapWidth = rows[rowIndex].length > 0 ? GAP : 0;
      if (rows[rowIndex].length > 0 && (aggregateWidth + gapWidth + itemWidth > containerWidth)) {
        rowIndex++;
        aggregateWidth = 0;
        gapWidth = 0;
        rows.push([]);
      }
      rows[rowIndex].push(item);
      aggregateWidth += gapWidth + itemWidth;
    }
    return rows;
  }, [items, containerWidth]);

  const lgItemProps = useMemo(() => {
    if (!lgItemPropsByRow) {
      return null;
    }
    return lgItemPropsByRow.reduce<MediaGalleryItemProps[]>((mp, rowItems, rowIndex) => {
      mp.push(...rowItems.reduce<MediaGalleryItemProps[]>((mpInRow, mi) => {
        const mediaURL = `/media/${mi.id}`;
        let thumbnailURL: string | undefined = undefined;
        // Use post / product image if media has no thumbnail (notably PDFs)
        if (!mi.thumbnail) {
          if (mi.source.type === 'post') {
            if (mi.source.thumbnail?.downloaded?.path) {
              thumbnailURL = `/media/post:${mi.source.id}:thumbnail`;
            }
            else if (mi.source.coverImage?.downloaded?.path) {
              thumbnailURL = `/media/post:${mi.source.id}:cover`;
            }
          }
          else if (mi.source.type === 'product') {
            const img = mi.source.previewMedia.find((pm) => pm.type === 'image' && pm.downloaded?.thumbnail?.path) ||
              mi.source.contentMedia.find((cm) => cm.type === 'image' && cm.downloaded?.thumbnail?.path)
            if (img) {
              thumbnailURL = `/media/${img.id}`;
            }
          }
        }
        else {
          thumbnailURL = `${mediaURL}?t=1`;
        }
        const isImage = !mi.mimeType || mi.mimeType.startsWith('image/');
        const isVideo = mi.mimeType?.startsWith('video/') ?? false;
        const isAudio = mi.mimeType?.startsWith('audio/') ?? false;
        const isPDF = mi.mimeType?.toLowerCase() === 'application/pdf';
        const href = isImage || isPDF ? mediaURL : undefined;
        const dataImage = isImage ? mediaURL : undefined;
        const dataAV = isVideo || isAudio ? JSON.stringify({
          source: [
            {
                src: mediaURL,
                type: mi.mimeType as string,
            },
          ],
          attributes: {
            preload: false,
            controls: true,
            playsInline: true
          }
        }) : undefined;
        const dataPoster = isVideo || isAudio ? thumbnailURL : undefined;
        const title = mi.source.type === 'post' ? mi.source.title : mi.source.name;
        const dataSubHTML =  title ? `<h4><a class="media-gallery__source-link" href="/posts/${mi.source.id}">${title}</a></h4>` : undefined;
        if (dataImage || dataAV || isPDF) {
          mpInRow.push({
            id: mi.id,
            href,
            dataSrc: dataImage,
            dataVideo: dataAV,
            dataPoster,
            dataIframe: isPDF,
            dataSubHTML,
            thumbnailURL,
            fixed: rowIndex === lgItemPropsByRow.length - 1,
            badge: isPDF ? 'PDF' : undefined
          });
        }
        return mpInRow;
      }, []));
      return mp;
    }, []);
  }, [lgItemPropsByRow]);

  return (
    <LightGallery
      speed={500}
      plugins={[lgThumbnail, lgZoom, lgVideo]}
      selector=".lightgallery-item"
    >
      <div
        ref={containerRef}
        className="w-100 media-gallery mb-4"
        style={{
          '--media-gallery-row-height': `${ROW_HEIGHT}px`,
          '--media-gallery-gap': `${GAP}px`,
          '--media-gallery-thumbnail-border': `${BORDER_WIDTH}px`,
        } as React.CSSProperties}
      >
        {lgItemProps ? lgItemProps.map((m) => <MediaGalleryItem key={`media-gallery-item-${m.id}`} {...m} />) : null}
      </div>
    </LightGallery>
  )
}

export default MediaGallery;