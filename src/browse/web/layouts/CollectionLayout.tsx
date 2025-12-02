import { Container, Row, Col } from "react-bootstrap";
import { Outlet, useParams } from "react-router";
import { useAPI } from "../contexts/APIProvider";
import { useEffect, useState } from "react";
import CampaignHeader from "../components/CampaignHeader";
import { type CampaignWithCounts } from "../../types/Campaign";
import CollectionBanner from "../components/CollectionBanner";
import { type Collection } from "../../../entities/Post";

function CollectionLayout() {
  const { id: collectionId } = useParams();

  if (!collectionId) {
    return null;
  }
  const { api } = useAPI();
  const [campaign, setCampaign] = useState<CampaignWithCounts | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    void (async () => {
      const { campaignId, collection } = await api.getCollection(collectionId);
      const campaign = await api.getCampaign({ id: campaignId, withCounts: true });
      if (!abortController.signal.aborted) {
        setCampaign(campaign);
        setCollection(collection);
      };
    })();

    return () => abortController.abort();
  }, [api, collectionId]);

  if (!campaign) {
    return null;
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col>
          <CampaignHeader campaign={campaign} />
        </Col>
      </Row>
      <Row className="justify-content-center g-0">
        <Col lg={8} md={10} sm={12} className="px-3 px-md-0 d-flex flex-column align-items-center justify-content-center">
          {collection && <CollectionBanner collection={collection} />}
          <Outlet />
        </Col>
      </Row>
    </Container>
  )
}

export default CollectionLayout;