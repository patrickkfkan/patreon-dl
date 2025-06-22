import { Container, Row, Col } from "react-bootstrap";
import { Outlet, useParams } from "react-router";
import { useAPI } from "../contexts/APIProvider";
import { useEffect, useState } from "react";
import CampaignHeader from "../components/CampaignHeader";
import { type CampaignWithCounts } from "../../types/Campaign";

function CampaignLayout() {
  const { id: campaignId } = useParams();

  if (!campaignId) {
    return null;
  }
  const { api } = useAPI();
  const [campaign, setCampaign] = useState<CampaignWithCounts | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    void (async () => {
      const campaign = await api.getCampaign({ id: campaignId, withCounts: true });
      if (!abortController.signal.aborted) {
        setCampaign(campaign);
      };
    })();

    return () => abortController.abort();
  }, [api, campaignId]);

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
        <Col lg={8} md={10} sm={12} className="px-3 px-md-0 d-flex justify-content-center">
          <Outlet />
        </Col>
      </Row>
    </Container>
  )
}

export default CampaignLayout;