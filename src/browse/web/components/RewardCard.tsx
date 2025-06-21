import "../assets/styles/RewardCard.scss";
import { Card, Stack } from "react-bootstrap";
import { type Reward } from "../../../entities";
import sanitize from "sanitize-html";

interface RewardCardProps {
  reward: Reward;
}

function RewardCard(props: RewardCardProps) {
  const { reward } = props;

  return (
    <Card className="reward-card mb-3">
      <Card.Body className="d-flex flex-column p-0">
        {
          reward.image?.downloaded?.path ? (
            <Card.Img className="reward-card__image" src={`/media/reward:${reward.id}:image`} />
          ) : null
        }
        <Stack className="flex-fill px-3 py-2">
          <Stack direction="horizontal" className="my-3 justify-content-between">
            <div className="reward-card__title">{reward.title}</div>
            <div>{reward.amount || ''}</div>
          </Stack>
          <div className="reward-card__content w-100" dangerouslySetInnerHTML={{__html: sanitize(reward.description || '')}}/>
        </Stack>
      </Card.Body>
    </Card>
  )
}

export default RewardCard;