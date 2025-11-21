import { useEffect, useReducer, useState } from "react";
import copy from 'fast-copy';
import deepEqual from "deep-equal";
import { useAPI } from "../contexts/APIProvider";
import { type CollectionList, type CollectionListSortBy } from "../../types/Content";
import { Container, Row, Col, Form } from "react-bootstrap";
import CollectionCard from "../components/CollectionCard";
import ShowingText from "../components/ShowingText";
import PageNav from "../components/PageNav";
import { useParams, useSearchParams } from "react-router";
import { useScroll } from "../contexts/MainContentScrollProvider";
import { type BrowseSettings } from "../../types/Settings";
import { useBrowseSettings } from "../contexts/BrowseSettingsProvider";

interface ViewParams {
  sortBy: CollectionListSortBy;
  page: number | null;
  itemsPerPage: number;
}

type ViewParamsValue = {
  [T in keyof ViewParams]?: ViewParams[T];
};

function getInitialViewParams(settings: BrowseSettings): ViewParams {
  return {
    sortBy: 'last_updated',
    page: null,
    itemsPerPage: settings.listItemsPerPage
  };
}

const viewParamsReducer = (
  currentParams: ViewParams,
  values: ViewParamsValue
) => {
  const newParams = copy(currentParams);
  if (values.sortBy !== undefined) {
    newParams.sortBy = values.sortBy;
  }
  if (values.page !== undefined) {
    newParams.page = values.page;
  }
  if (values.itemsPerPage !== undefined) {
    newParams.itemsPerPage = values.itemsPerPage;
  }
  return deepEqual(newParams, currentParams) ? currentParams : newParams;
};

function CollectionList() {
  const { id: campaignId } = useParams();
  const { api } = useAPI();
  const { settings } = useBrowseSettings();
  const { scrollTo } = useScroll();
  const [viewParams, setViewParams] = useReducer(viewParamsReducer, getInitialViewParams(settings));
  const [list, setList] = useState<CollectionList | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const { sortBy, page } = viewParams;
    if (!campaignId || sortBy === null || page === null) {
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const _list = await api.getCollectionList({
        ...viewParams,
        campaign: campaignId,
        sortBy,
        page
      });
      if (!abortController.signal.aborted) {
        setList(_list);
      }
    })();

    return () => abortController.abort();
  }, [api, viewParams]);

  useEffect(() => {
    const page = Number(searchParams.get('p')) || 1;
    setViewParams({ page });
    scrollTo(0, 0);
  }, [searchParams, scrollTo]);

  useEffect(() => {
    setViewParams({
      itemsPerPage: settings.listItemsPerPage
    })
  }, [settings.listItemsPerPage]);

  const gotoPage = (page: number, replaceState = false) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('p', String(page));
      return params;
    }, { replace: replaceState });
  }

  useEffect(() => {
    if (list && list.collections.length === 0 && list.total > 0) {
      // Most likely page is out of range. If so go to the first page.
      gotoPage(1, true);
    }
  }, [list, gotoPage]);

  if (!list) {
    return;
  }

  return (
    <Container fluid>
      <Row className="g-0 justify-content-center">
        <Col md={10} sm={12} style={{maxWidth: '40.5em'}}>
          <Container fluid className="p-0">
            <Row className="mb-2 g-0 justify-content-center align-items-center">
              <Col className="w-auto flex-fill">
                { viewParams.page ? <ShowingText
                  total={list.total}
                  page={viewParams.page}
                  itemsPerPage={viewParams.itemsPerPage}
                  subject={{
                    singular: 'collection',
                    plural: 'collections'
                  }} /> : null }
              </Col>
              <Col className="w-auto d-flex justify-content-end">
                <Form.Select
                  size="sm"
                  className="w-auto"
                  onChange={(e) => setViewParams({ sortBy: e.currentTarget.value as any })}
                >
                  <option value="a-z" selected={viewParams.sortBy === 'a-z'}>A-Z</option>
                  <option value="z-a" selected={viewParams.sortBy === 'z-a'}>Z-A</option>
                  <option value="last_created" selected={viewParams.sortBy === 'last_created'}>Last created</option>
                  <option value="last_updated" selected={viewParams.sortBy === 'last_updated'}>Last updated</option>
                </Form.Select>
              </Col>
            </Row>
          </Container>
          <div className="mb-4">
            {
              list.collections.map((collection) => (
                <CollectionCard collection={collection} />
              ))
            }
          </div>
          <PageNav
            totalItems={list.total}
            itemsPerPage={viewParams.itemsPerPage}
            onChange={gotoPage}
          />
        </Col>
      </Row>
    </Container>
  )
}
export default CollectionList;
