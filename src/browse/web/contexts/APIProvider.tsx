import { createContext, useContext } from 'react';
import { type CampaignList, type CampaignListSortBy, type CampaignWithCounts } from '../../types/Campaign';
import { type ContentType, type ContentList, type PostWithComments } from '../../types/Content';
import { type Campaign, type Product } from '../../../entities';
import { type BrowseSettings, type BrowseSettingOptions as BrowseSettingOptions } from '../../types/Settings';
import { type Filter, type FilterSearchParams, type FilterData, type MediaFilterSearchParams, type PostFilterSearchParams } from '../../types/Filter';
import { type MediaList } from '../../types/Media';

interface APIProviderProps {
  children: React.ReactNode;
}

export interface APIContextValue {
  api: API;
}

class API {

  async getCampaignList(params: {
    sortBy?: CampaignListSortBy;
    page?: number;
    itemsPerPage: number;
  }): Promise<CampaignList> {
    const urlObj = new URL('/api/campaigns', window.location.href);
    if (params.sortBy) {
      urlObj.searchParams.append('sort_by', params.sortBy);
    }
    this.#setPaginationParams(urlObj, params);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getContentList<T extends ContentType>(params: {
    campaign: Campaign;
    type?: ContentType;
    filter: Filter<PostFilterSearchParams>,
    page?: number;
    itemsPerPage: number;
  }): Promise<ContentList<T>> {
    const { campaign, filter } = params;
    const contentType =
      params.type === 'post' ? 'posts'
      : params.type === 'product' ? 'products'
      : 'content';
    const urlObj = new URL(`/api/campaigns/${campaign.id}/${contentType}`, window.location.href);
    this.#setFilterParams(urlObj, filter);
    this.#setPaginationParams(urlObj, params);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getCampaign(params: {
    id: string;
    withCounts: true;
  }): Promise<CampaignWithCounts>
  async getCampaign(params: {
    id: string;
    withCounts?: false;
  }): Promise<Campaign>
  async getCampaign(params: {
    id: string;
    withCounts?: boolean;
  }): Promise<Campaign | CampaignWithCounts>
  async getCampaign(params: {
    id: string;
    withCounts?: boolean;
  }) {
    const { withCounts = false } = params;
    const urlObj = new URL(`/api/campaigns/${params.id}`, window.location.href);
    urlObj.searchParams.append('with_counts', withCounts ? 'true' : 'false' );
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getContentFilterOptions(
    campaign: Campaign | string,
    contentType: ContentType
  ): Promise<FilterData<PostFilterSearchParams>> {
    const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
    const ct = contentType === 'post' ? 'posts' : 'products';
    const urlObj = new URL(`/api/campaigns/${campaignId}/${ct}/filter_options`, window.location.href);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getPost(id: string): Promise<PostWithComments> {
    const urlObj = new URL(`/api/posts/${id}`, window.location.href).toString();
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getProduct(id: string): Promise<Product | null> {
    const urlObj = new URL(`/api/products/${id}`, window.location.href);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getBrowseSettings(): Promise<BrowseSettings> {
    const urlObj = new URL(`/api/settings/browse`, window.location.href);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getBrowseSettingOptions(): Promise<BrowseSettingOptions> {
    const urlObj = new URL(`/api/settings/browse/options`, window.location.href);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getMediaList<T extends ContentType>(params: {
    campaign: Campaign;
    filter: Filter<MediaFilterSearchParams>,
    page?: number;
    itemsPerPage: number;
  }): Promise<MediaList<T>> {
    const { campaign, filter } = params;
    const urlObj = new URL(`/api/campaigns/${campaign.id}/media`, window.location.href);
    this.#setFilterParams(urlObj, filter);
    this.#setPaginationParams(urlObj, params);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  async getMediaFilterOptions(
    campaign: Campaign | string
  ): Promise<FilterData<MediaFilterSearchParams>> {
    const campaignId = typeof campaign === 'string' ? campaign : campaign.id;
    const urlObj = new URL(`/api/campaigns/${campaignId}/media/filter_options`, window.location.href);
    const result = await fetch(urlObj.toString());
    return await result.json();
  }

  saveBrowseSettings(settings: BrowseSettings) {
    return fetch("/api/settings/browse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  }

  #setPaginationParams(
    url: URL,
    params: {
      page?: number;
      itemsPerPage: number;
    }
  ) {
    if (params.page) {
      url.searchParams.append('p', String(params.page));
    }
    url.searchParams.append('n', String(params.itemsPerPage));
  }

  #setFilterParams<S extends FilterSearchParams>(url: URL, filter: Filter<S>) {
    filter.options.forEach(({searchParam: param, value}) => {
      if (value === null) {
        url.searchParams.delete(param);
      }
      else {
        url.searchParams.append(param, value);
      }
    });
  }
}

const APIContext = createContext({} as APIContextValue);

function APIProvider(props: APIProviderProps) {
  const { children } = props;

  return (
    <APIContext.Provider value={{ api: new API() }}>
      {children}
    </APIContext.Provider>
  );
};

const useAPI = () => useContext(APIContext);

export { useAPI, APIProvider };
