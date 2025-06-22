import { useEffect, useState } from "react";
import { useAPI } from "../contexts/APIProvider";
import { useNavigate, useParams } from "react-router";
import { type CampaignWithCounts } from "../../types/Campaign";

function CampaignHome() {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const { api } = useAPI();
  const [campaign, setCampaign] = useState<CampaignWithCounts | null>(null);

  useEffect(() => {
    if (!campaignId) {
      return;
    } 
    const abortController = new AbortController();
    void (async () => {
      const campaign = await api.getCampaign({ id: campaignId, withCounts: true });
      if (!abortController.signal.aborted) {
        setCampaign(campaign);
      }
    })();

    return () => abortController.abort();
  }, [api, campaignId]);

  useEffect(() => {
    if (!campaign) {
      return;
    }
    void (async () => {
      let p = '';
      if (campaign.postCount > 0) {
        p = `posts`;
      }
      else if (campaign.productCount > 0) {
        p = 'shop';
      }
      else if (campaign.mediaCount > 0) {
        p = 'media';
      }
      else {
        p = 'about';
      }
      await navigate(`/campaigns/${campaign.id}/${p}`, { replace: true });
      return;
    })();
  }, [api, campaign, navigate]);

  return null;
}

export default CampaignHome;
