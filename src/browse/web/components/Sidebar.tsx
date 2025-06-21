import "../assets/styles/Sidebar.scss";
import GithubIcon from "../assets/images/brands-github.svg?react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Stack } from "react-bootstrap";
import { type Campaign } from "../../../entities";
import { useAPI } from "../contexts/APIProvider";
import { Link } from "react-router";
import { useGlobalModals } from "../contexts/GlobalModalsProvider";
import CustomScrollbars from "./CustomScrollbars";
import MediaImage from "./MediaImage";

interface SidebarProps {
  closeButton?: boolean;
  onClose?: () => void;
}

function Sidebar(props: SidebarProps) {
  const { closeButton = false, onClose } = props;
  const { api } = useAPI();
  const { showBrowseSettingsModal } = useGlobalModals();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    void (async () => {
      const campaigns = (await api.getCampaignList({ sortBy: 'last_downloaded', itemsPerPage: 10 })).campaigns;
      if (!abortController.signal.aborted) {
        setCampaigns(campaigns);
      }
    })();

    return () => abortController.abort();
  }, [api]);

  const handleLinkClick = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleSettingsLinkClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) {
      onClose();
    }
    showBrowseSettingsModal();
  }, [onClose, showBrowseSettingsModal]);

  const campaignLinks = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return null;
    }
    const links = campaigns.map((campaign) => (
      <Link
        to={`/campaigns/${campaign.id}`}
        className="sidebar__link"
        onClick={handleLinkClick}
      >
        <MediaImage
          className="sidebar__link-icon me-2"
          mediaId={`campaign:${campaign.id}:avatar`}
        />
        <span className="sidebar__link-text">{campaign.name}</span>
      </Link>
    ));
    return (
      <Stack className="mt-4 mb-5 px-3" gap={3}>
        <h6 className="sidebar__section-title">Recently downloaded</h6>
        {links}
      </Stack>
    )
  }, [campaigns]);

  return (
    <>
      <Card className="sidebar p-0">
        <Stack className="overflow-hidden">
          <Stack direction="horizontal" className="sidebar__header justify-content-between p-3">
            <div className="sidebar__brand fs-5 fw-bold">
              <Link
                to="/"
                onClick={handleLinkClick}
              >
                patreon-dl
              </Link>
            </div>
            {
              closeButton ? (
                <button className="btn-close" onClick={onClose ? () => onClose() : undefined}></button>
              ) : null
            }
          </Stack>
          <CustomScrollbars
            viewClassName="sidebar__main"
          >
            <Stack className="flex-fill">
              {campaignLinks}
              <Stack className="justify-content-end px-3 pb-3" gap={3}>
                <a
                  href="#"
                  className="sidebar__link"
                  onClick={handleSettingsLinkClick}
                >
                  <span className="material-icons me-2">settings</span>
                  <span className="sidebar__link-text">Settings</span>
                </a>
                <Link
                  to="https://github.com/patrickkfkan/patreon-dl"
                  className="sidebar__link"
                  onClick={handleLinkClick}
                >
                  <GithubIcon className="sidebar__link-icon sidebar__link-icon--svg me-2" />
                  <span className="sidebar__link-text">Project homepage</span>
                </Link>
              </Stack>
            </Stack>
          </CustomScrollbars>
        </Stack>
      </Card>
    </>
  );
};

export default Sidebar;