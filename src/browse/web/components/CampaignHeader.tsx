import "../assets/styles/CampaignHeader.scss";
import { NavLink } from "react-router";
import { type CampaignWithCounts } from "../../types/Campaign";
import { useMemo } from "react";
import RawDataExtractor from "../utils/RawDataExtractor";
import { Stack } from "react-bootstrap";
import MediaImage from "./MediaImage";

interface CampaignHeaderProps {
  campaign: CampaignWithCounts
}

function CampaignHeader(props: CampaignHeaderProps) {
  const { campaign } = props;
  const coverMediaId = campaign.coverPhoto.downloaded?.path ? campaign.coverPhoto.id : null;
  const avatarMediaId = campaign.avatarImage.downloaded?.path ? campaign.avatarImage.id : null;

  const navBar = useMemo(() => {
    const links: { title: string; url: string; }[] = [];
    if (campaign.postCount > 0) {
      links.push({
        title: 'Posts',
        url: `/campaigns/${campaign.id}/posts`
      });
    }
    if (campaign.collectionCount > 0) {
      links.push({
        title: 'Collections',
        url: `/campaigns/${campaign.id}/collections`
      });
    }
    if (campaign.productCount > 0) {
      links.push({
        title: 'Shop',
        url: `/campaigns/${campaign.id}/shop`
      });
    }
    if (campaign.mediaCount > 0) {
      links.push({
        title: 'Media',
        url: `/campaigns/${campaign.id}/media`
      });
    }
    links.push({
      title: 'About',
      url: `/campaigns/${campaign.id}/about`
    });
    return (
      <Stack
        direction="horizontal"
        className="campaign-header__nav justify-content-center mb-5"
        gap={4}
      >
        {
          links.map(({title, url}) => (
            <NavLink to={url}>{title}</NavLink>
          ))
        }
      </Stack>
    )
  }, [campaign])

  const coverPhoto = useMemo(() => {
    if (!coverMediaId) {
      return null;
    }
    return (
      <div className="w-100">
        <MediaImage
          className="campaign-header__cover"
          mediaId={coverMediaId}
        />
      </div>
    )
  }, [coverMediaId]);

  const avatarImage = useMemo(() => {
    if (!avatarMediaId) {
      return null;
    }
    return (
      <div className="mb-2">
        <MediaImage
          className="campaign-header__avatar rounded"
          mediaId={avatarMediaId}
        />
      </div>
    )
  }, [avatarMediaId]);

  const info = useMemo(() => {
    const creationName = RawDataExtractor.getCampaignCreationName(campaign);
    return (
      <Stack className="w-100 px-3 align-items-center">
        <h3>
          {campaign.name}
        </h3>
        {creationName ? <div className="text-body-secondary">{creationName}</div> : null}
      </Stack>
    )
  }, [campaign]);

  const top = useMemo(() => {
    if (coverPhoto && avatarImage) {
      return (
        <Stack
          className="w-100 align-items-center"
          style={{marginBottom: "-2em"}}
        >
          {coverPhoto}
          <Stack
            className="align-items-center"
            style={{ transform: "translateY(-4em)"}}
          >
            {avatarImage}
            {info}
          </Stack>
        </Stack>
      )
    }
    if (coverPhoto) {
      return (
        <>
          {coverPhoto}
          <Stack
            className="align-items-center my-4"
          >
            {info}
          </Stack>
        </>
      )
    }
    if (avatarImage) {
      return (
        <Stack
          className="w-100 align-items-center my-4"
        >
          {avatarImage}
          {info}
        </Stack>
      )
    }
    return (
      <Stack className="w-100 align-items-center my-4">
        {info}
      </Stack>
    )
  }, [coverPhoto, avatarImage, info]);

  return (
    <>
      {top}
      {navBar}
    </>
  )
}

export default CampaignHeader;