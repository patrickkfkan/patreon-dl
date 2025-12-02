import "../assets/styles/CollectionBanner.scss";
import { type Collection } from "../../../entities/Post";
import { Card, Stack } from "react-bootstrap";
import MediaImage from "./MediaImage";
import FadeContent from "./FadeContent";

interface CollectionBannerProps {
  collection: Collection;
}

function CollectionBanner({ collection }: CollectionBannerProps) {

  const thumbnailId = collection.thumbnail?.downloaded?.path ? collection.thumbnail.id : null;
  const nodesc = !collection.description;

  return (
    <Card className={`collection-banner w-100 mb-3 ${nodesc ? 'collection-banner--nodesc' : ''}`}>
      <FadeContent maxHeight={130}>
        <Card.Body className="d-flex p-0">
          {thumbnailId && (
            <div className="collection-banner__thumbnail">
              <MediaImage mediaId={thumbnailId} />
            </div>
          )}
          <Stack className="flex-fill overflow-hidden px-3">
            <div className="collection-banner__title d-flex">
              {collection.title}
            </div>
            {
              collection.description && (
                <div className="collection-banner__description">
                  {collection.description}
                </div>
              )
            }
          </Stack>
        </Card.Body>
      </FadeContent>
    </Card>
  );
}

export default CollectionBanner;