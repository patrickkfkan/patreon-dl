import "../assets/styles/CampaignContent.scss";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useAPI } from "../contexts/APIProvider";
import { Container, Row, Col, Card, Stack } from "react-bootstrap";
import ShowingText from "../components/ShowingText";
import { type ContentType, type ContentList } from "../../types/Content";
import { type Campaign } from "../../../entities";
import { NavigationType, useNavigationType, useParams, useSearchParams } from "react-router";
import PostCard from "../components/PostCard";
import PageNav from "../components/PageNav";
import deepEqual from "deep-equal";
import copy from 'fast-copy';
import { useScroll } from "../contexts/MainContentScrollProvider";
import { type BrowseSettings } from "../../types/Settings";
import { useBrowseSettings } from "../contexts/BrowseSettingsProvider";
import { type Filter, type FilterData, type PostFilterSearchParams } from "../../types/Filter";
import FilterModalButton from "../components/FilterModalButton";
import ProductList from "../components/ProductList";

interface CampaignContentProps<T extends ContentType> {
  type: T;
}

interface ViewParams {
  filter: Filter<PostFilterSearchParams> | null;
  page: number | null;
  itemsPerPage: number;
}

type ViewParamsValues = {
  [T in keyof ViewParams]?: ViewParams[T];
};

function getInitialViewParams(settings: BrowseSettings): ViewParams {
  return {
    filter: null,
    page: null,
    itemsPerPage: settings.listItemsPerPage
  };
}

const viewParamsReducer = (
  currentParams: ViewParams,
  values: ViewParamsValues
) => {
  const newParams = copy(currentParams);
  if (values.filter !== undefined) {
    newParams.filter = values.filter;
  }
  if (values.page !== undefined) {
    newParams.page = values.page;
  }
  if (values.itemsPerPage !== undefined) {
    newParams.itemsPerPage = values.itemsPerPage;
  }
  return deepEqual(newParams, currentParams) ? currentParams : newParams;
};

function CampaignContent<T extends ContentType>(props: CampaignContentProps<T>) {
  const { type: contentType } = props;
  const { id: campaignId } = useParams();
  const [ contextQS, setContextQS ] = useState('');

  let subject: { singular: string; plural: string };
  switch (contentType) {
    case 'post':
      subject = { singular: 'post', plural: 'posts' };
      break;
    case 'product':
    default:
      subject = { singular: 'product', plural: 'products' };
      break;
  }
  const { api } = useAPI();
  const { settings } = useBrowseSettings();
  const { scrollTo } = useScroll();
  const [viewParams, setViewParams] = useReducer(viewParamsReducer, getInitialViewParams(settings));
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [list, setList] = useState<ContentList<T> | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterData<PostFilterSearchParams> | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (!campaignId) {
      return;
    }
    setFilterOptions(null);
    const abortController = new AbortController();
    void (async () => {
      const options = await api.getContentFilterOptions(campaignId, contentType);
      if (!abortController.signal.aborted) {
        setFilterOptions(options);
      }
    })();

    return () => abortController.abort();
  }, [api, campaignId, contentType]);

  const gotoPage = useCallback((page: number, replaceState = false) => {
    setSearchParams((/*prev*/) => {
      // Do not use "prev" passed by setSearchParams, as it can be
      // stale, unless we set the method as a dependency (which will
      // in turn cause ContentFilterButton to needlessly re-render,
      // with filter re-applied, etc.).
      const params = new URLSearchParams(window.location.search);
      params.set('p', String(page));
      return params;
    }, { replace: replaceState });
  }, []);

  // Reset first load status on browser back so page won't get reset to 1
  // on applying filter
  useEffect(() => {
    if (navigationType === NavigationType.Pop) {
      isFirstLoadRef.current = true;
    }
  }, [navigationType]);

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

  useEffect(() => {
    const { filter, page } = viewParams;
    if (!campaign || !filter || page === null) {
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const _list = await api.getContentList({
        campaign,
        type: contentType,
        ...viewParams,
        filter,
        page
      });
      if (!abortController.signal.aborted) {
        setList(_list);
      }
    })();

    return () => abortController.abort();
  }, [api, campaign, contentType, viewParams]);

  useEffect(() => {
    const page = Number(searchParams.get('p')) || 1;
    setViewParams({ page });
    scrollTo(0, 0);
  }, [searchParams, scrollTo]);

  const applyFilter = useCallback((filter: Filter<PostFilterSearchParams>) => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      setViewParams({ filter });
    }
    else {
      setViewParams({ filter, page: 1 });
    }
  }, []);

  useEffect(() => {
    setViewParams({
      itemsPerPage: settings.listItemsPerPage
    });
  }, [settings.listItemsPerPage]);

  useEffect(() => {
    if (list && list.items.length === 0 && list.total > 0) {
      // Most likely page is out of range. If so go to the first page.
      gotoPage(1, true);
    }
  }, [list, gotoPage]);

  // Keep the 'p' param in URL in sync with viewParams.page.
  // Mismatch can happen in applyFilter where reset viewParams.page
  // following a change in the content filter.
  useEffect(() => {
    if (viewParams.page === null) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const p = Number(params.get('p')) || 1;
    if (p !== viewParams.page) {
      gotoPage(viewParams.page, true);
    }
  }, [viewParams, gotoPage]);

  useEffect(() => {
    const filter = viewParams.filter;
    if (!filter) {
      setContextQS('');
      return;
    }
    const params = new URLSearchParams();
    for (const { searchParam, value } of filter.options) {
      if (value) {
        params.set(searchParam, value);
      }
    }
    setContextQS(params.toString());
  }, [viewParams.filter]);

  const listEl = useMemo(() => {
    if (!list || list.items.length === 0) {
      return null;
    }
    if (list.items.every((item) => item.type === 'post')) {
      return (
        <Stack className="mb-4" gap={4}>
          {
            (list as ContentList<'post'>).items.map((item) => (
              <PostCard
                key={`post-card-${item.id}`}
                post={item}
                useShowMore
                contextQS={contextQS}
              />
            ))
          }
        </Stack>
      )
    }
    if (list.items.every((item) => item.type === 'product')) {
      return (
        <ProductList products={(list as ContentList<'product'>).items} />
      )
    }
    return null;
  }, [list, contextQS]);

  if (!campaign || !filterOptions) {
    return;
  }

  return (
    <div className={`campaign-content campaign-content--${contentType}`}>
      <Container fluid className="p-0">
        <Row className="mb-2 g-0 justify-content-center align-items-center">
          <Col className="w-auto flex-fill">
            {list && list.items.length > 0 && viewParams.page ? <ShowingText
              total={list.total}
              page={viewParams.page}
              itemsPerPage={viewParams.itemsPerPage}
              subject={subject} /> : null}
          </Col>
          <Col className="w-auto d-flex justify-content-end">
            <FilterModalButton
              options={filterOptions}
              onFilter={applyFilter}
            />
          </Col>
        </Row>
      </Container>
      {listEl}
      {
        list && list.items.length === 0 ? (
          <Card className="my-4" style={{ height: "10em" }}>
            <Card.Body className="d-flex justify-content-center align-items-center">
              No {contentType === 'post' ? 'posts' : 'products'}
            </Card.Body>
          </Card>
        ) : null
      }
      {list ? <PageNav
        totalItems={list.total}
        itemsPerPage={viewParams.itemsPerPage}
        onChange={gotoPage}
      /> : null}
    </div>
  )
}

export default CampaignContent;
