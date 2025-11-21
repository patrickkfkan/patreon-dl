import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAPI } from "../contexts/APIProvider";

function CollectionContent() {
  const { id: collectionId } = useParams();
  const { api } = useAPI();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!collectionId) {
      return;
    }
    const abortController = new AbortController();
    void (async() => {
      const { collection, campaignId } = await api.getCollection(collectionId);
      const sp = new URLSearchParams({ collection_id: collection.id });
      const url = `/campaigns/${campaignId}/posts?${sp.toString()}`;
      if (!abortController.signal.aborted) {
        await navigate(url, { replace: true });
      }
    })();

    return () => abortController.abort();
  }, [api, collectionId, navigate]);

  return null;
}

export default CollectionContent;