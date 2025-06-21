import "../assets/styles/CampaignCard.scss";
import { Link } from "react-router";
import { Card, Stack } from "react-bootstrap";
import RawDataExtractor from "../utils/RawDataExtractor";
import { type CampaignWithCounts } from "../../types/Campaign";
import MediaImage from "./MediaImage";

interface CampaignCardProps {
  campaign: CampaignWithCounts;
}

const COUNT_ICONS: Partial<Record<keyof CampaignWithCounts, string>> = {
  postCount: 'article',
  mediaCount: 'image',
  productCount: 'storefront'
};

function CampaignCard(props: CampaignCardProps) {
  const { campaign } = props;
  const creationName = RawDataExtractor.getCampaignCreationName(campaign);

  const countElements: React.ReactElement[] = 
    ['postCount', 'productCount', 'mediaCount'].reduce<React.ReactElement[]>((result, key) => {
      if (campaign[key] > 0) {
        result.push((
          <Stack key={`${campaign.id}:${key}`} direction="horizontal" style={{alignSelf: 'auto'}}>
            <span className="campaign-card__count-icon material-icons-outlined">{COUNT_ICONS[key]}</span>
            <span className="campaign-card__count-text">{campaign[key]}</span>
          </Stack>
        ));
      }
      return result;
    }, []);

  return (
    <Card className="campaign-card mb-3">
      <Card.Body className="d-flex p-0">
        <MediaImage
          className="campaign-card__avatar"
          mediaId={`campaign:${campaign.id}:avatar`}
        />
        <Stack className="flex-fill overflow-hidden px-3 py-2">
          <h6 className="campaign-card__title">
            <Link to={`/campaigns/${campaign.id}`}>
              {campaign.name}
            </Link>
          </h6>
          {
            creationName ? (
              <div className="campaign-card__creation-name">
                {creationName}
              </div>
            ) : null
          }
          <Stack
            direction="horizontal"
            className="flex-fill align-items-end text-body-secondary"
            gap={3}>
            {...countElements}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  )
}

export default CampaignCard;