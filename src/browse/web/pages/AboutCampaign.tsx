import "../assets/styles/Slider.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAPI } from "../contexts/APIProvider";
import { type Campaign, type Reward } from "../../../entities";
import { useParams } from "react-router";
import sanitize from "sanitize-html";
import RewardCard from "../components/RewardCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SliderArrow from "../components/SliderArrow";
import { Stack } from "react-bootstrap";

const MIN_TIER_CARD_WIDTH = 300;

function AboutCampaign() {
  const { id: campaignId } = useParams();
  const { api } = useAPI();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
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

  useEffect(() => {
    if (!campaignId) {
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const campaign = await api.getCampaign({ id: campaignId });
      if (!abortController.signal.aborted) {
        setCampaign(campaign);
      }
    })();

    return () => abortController.abort();
  }, [api, campaignId]);

  const rewardSlider = useMemo(() => {
    if (!campaign || !containerWidth) {
      return null;
    }
    const slidesToShow = Math.floor(containerWidth / MIN_TIER_CARD_WIDTH);
    // Filter out Public and Free tiers
    const filtered = campaign.rewards.reduce<Reward[]>((result, reward) => {
      const isPublic = reward.id === '-1';
      // Note API data actually has 'is_free_tier' property, but we didn't save 
      // it in Reward object :(  We'll just check whether amount starts with '0 '.
      // This works because the amount string is actually formed by the parser
      // joining the API data's amount value and currency.
      const isFree = reward.amount && reward.amount.startsWith('0 ');
      if (!isPublic && !isFree) {
        result.push(reward);
      }
      return result;
    }, []);
    if (filtered.length === 0) {
      return null;
    }

    if (slidesToShow >= filtered.length) {
      return (
        <>
          <h4 className="mb-3">Tiers</h4>
          <Stack
            direction="horizontal"
            className="justify-content-center align-items-stretch mb-5"
            gap={3}
          >
            {
              filtered.map((reward) => (
                <div style={{width: `${MIN_TIER_CARD_WIDTH}px`}}>
                  <RewardCard reward={reward} />
                </div>
              ))
            }
          </Stack>
        </>
      )
    }

    return (
      <>
        <h4 className="mb-3">Tiers</h4>
        <Slider
          className="slider--h100 mb-5"
          dots
          speed={500}
          slidesToShow={slidesToShow}
          slidesToScroll={1}
          swipeToSlide
          dotsClass="slick-dots slider__dots"
          prevArrow={<SliderArrow type="prev" />}
          nextArrow={<SliderArrow type="next" />}
        >
          {
            filtered.map((reward) => (
              <div className="px-1">
                <RewardCard reward={reward} />
              </div>
            ))
          }
        </Slider>
      </>
    );
  }, [campaign, containerWidth]);

  return (
    <Stack ref={containerRef} className="w-100">
      {rewardSlider}
      {
        campaign ? (
          <div
            className="mb-4"
            dangerouslySetInnerHTML={{__html: sanitize(campaign.summary || '')}}
          />
        ) : null
      }
    </Stack>
  )
}

export default AboutCampaign;
