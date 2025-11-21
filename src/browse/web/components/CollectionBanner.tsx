import "../assets/styles/CollectionBanner.scss";
import { useEffect, useState } from "react";
import { type Collection } from "../../../entities/Post";
import { useAPI } from "../contexts/APIProvider";
import { Card, Stack } from "react-bootstrap";
import MediaImage from "./MediaImage";
import { useSearchParams } from "react-router";
import FadeContent from "./FadeContent";

function getCollectionIdFromLocation() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('collection_id');
}

function CollectionBanner() {
  const { api } = useAPI();
  const [collectionId, setCollectionId] = useState<string | null>(getCollectionIdFromLocation());
  const [collection, setCollection] = useState<Collection | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    setCollectionId(getCollectionIdFromLocation());
  }, [searchParams]);

  useEffect(() => {
    if (!collectionId) {
      setCollection(null);
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const { collection: c } = await api.getCollection(collectionId);
      if (!abortController.signal.aborted) {
        setCollection(c);
      }
    })();

    return () => abortController.abort();
  }, [api, collectionId]);

  if (!collection) {
    return null;
  }

  const thumbnailId = collection.thumbnail?.downloaded?.path ? collection.thumbnail.id : null;
  const nodesc = !collection.description;

  return (
    <Card className={`collection-banner mb-3 ${nodesc ? 'collection-banner--nodesc' : ''}`}>
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