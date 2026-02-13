import PageParser from "../parsers/PageParser.js";
import { URLHelper } from "../utils/index.js";
import type Fetcher from "../utils/Fetcher.js";
import { type Logger, type LogLevel } from "../utils/logging/index.js";
import { commonLog } from "../utils/logging/Logger.js";
import ObjectHelper from "../utils/ObjectHelper.js";
import { type DownloaderConfig } from "./Downloader.js";

export class InitialData {
  name = 'InitialData';

  protected config: DownloaderConfig<any>;
  protected fetcher: Fetcher;
  protected logger?: Logger | null;

  constructor(config: DownloaderConfig<any>, fetcher: Fetcher, logger?: Logger | null) {
    this.config = config;
    this.fetcher = fetcher;
    this.logger = logger;
  }

  async get(url: string, signal?: AbortSignal) {
    let campaignId: string | null = null;
    let currentUserId: string | undefined = undefined;
    let fetchCurrentUserIdFromAPI = false;
    if (this.config.type === 'post' &&
      this.config.postFetch.type !== 'single' &&
      this.config.postFetch.type !== 'byFile' &&
      this.config.postFetch.campaignId
    ) {
      campaignId = this.config.postFetch.campaignId;
      fetchCurrentUserIdFromAPI = true;
    }
    else if (this.config.type === 'product' &&
      this.config.productFetch.type === 'byShop' &&
      this.config.productFetch.campaignId
    ) {
      campaignId = this.config.productFetch.campaignId;
      fetchCurrentUserIdFromAPI = true;
    }
    if (!campaignId) {
      this.log('debug', `Fetch initial data from "${url}"`);
      let page;
      try {
        const { html, lastUrl } = await this.fetcher.get({ url, type: 'html', maxRetries: this.config.request.maxRetries, signal });
        page = html;
        if (new URL(lastUrl).pathname === '/login-sync-domains') {
          this.log('debug', `Detected Cloudflare challenge flow at "${lastUrl}"`);
          page = await this.#fetchPageWithPuppeteer(url);
          // Because cookie not available to Puppeteer, we need to fetch 
          // current user ID separately
          fetchCurrentUserIdFromAPI = !!this.config.cookie;
        }
      }
      catch (error) {
        if (signal?.aborted) {
          throw error;
        }
        const e = Error(`Error requesting "${url}"`);
        e.cause = error;
        throw e;
      }
      const pageParser = new PageParser(this.logger);
      let initialData;
      try {
        initialData = pageParser.parseInitialData(page, url);
      }
      catch (error) {
        const e = Error(`Error parsing initial data from "${url}"`);
        e.cause = error;
        throw e;
      }
      campaignId = ObjectHelper.getProperty(initialData, 'pageBootstrap.campaign.data.id');
      currentUserId = ObjectHelper.getProperty(initialData, 'commonBootstrap.currentUser.data.id');
      if (!campaignId) {
        throw Error(`Campaign ID not found in initial data of "${url}"`);
      }
    }
    if (fetchCurrentUserIdFromAPI) {
      this.log('debug', `Fetch current user ID from API`);
      const currentUserAPIURL = URLHelper.constructCurrentUserAPIURL();
      const { json: currentUserJson } = await this.fetcher.get({
        url: currentUserAPIURL,
        type: 'json',
        maxRetries: this.config.request.maxRetries,
        signal
      });
      currentUserId = ObjectHelper.getProperty(currentUserJson, 'data.id') || undefined;
    }
    this.log('debug', `Initial data: campaign ID '${campaignId}'; current user ID '${currentUserId}'`);
    return { campaignId, currentUserId };
  }

  async #fetchPageWithPuppeteer(url: string) {
    return this.fetcher.getPageWithPuppeteer(url);
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.logger, level, this.name, ...msg);
  }
}