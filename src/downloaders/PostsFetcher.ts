import EventEmitter from 'events';
import { type Post } from '../entities/index.js';
import { type Logger } from '../utils/logging/index.js';
import { type LogLevel, commonLog } from '../utils/logging/Logger.js';
import { type DownloaderConfig } from './Downloader.js';
import URLHelper, { PostSortOrder } from '../utils/URLHelper.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import PageParser from '../parsers/PageParser.js';
import type Fetcher from '../utils/Fetcher.js';
import PostParser from '../parsers/PostParser.js';
import { type PostCollection } from '../entities/Post.js';
import Sleeper from '../utils/Sleeper.js';

export type PostsFetcherStatus = {
  status: 'ready' | 'running' | 'completed' | 'aborted';
  error?: undefined;
} | {
  status: 'error';
  error: any;
};

export type PostsFetcherEvent = 'fetched' | 'statusChange';
export type PostsFetcherEventPayload<T extends PostsFetcherEvent> =
  T extends 'fetched' ? {
    collection: PostCollection;
    index: number;
  } :
  T extends 'statusChange' ? {
    current: PostsFetcherStatus;
    old: PostsFetcherStatus;
  } :
  never;

export interface PostsFetcherResult {
  collection: PostCollection | null;
  error?: any;
  aborted: boolean;
}

const SLEEPER_INTERVAL = 900000; // 15 mins

export default class PostsFetcher extends EventEmitter {

  name = 'PostsFetcher';

  protected status: PostsFetcherStatus;
  protected config: DownloaderConfig<Post>;
  protected fetcher: Fetcher;
  protected signal?: AbortSignal;
  protected logger?: Logger | null;

  #pointers: {
    fetching: number | null;
    lastFetched: number | null;
    returning: number | null;
    lastReturned: number | null; // Last returned in next()
  };
  #fetched: PostCollection[];
  #total: number | null;
  #nextPromises: Array<Promise<PostsFetcherResult> | undefined>;
  #sleeper: Sleeper | null;
  #noSleep: boolean;

  constructor(params: {
    config: DownloaderConfig<Post>,
    fetcher: Fetcher,
    logger?: Logger | null,
    signal?: AbortSignal
  }) {
    super();
    const { config, fetcher, logger, signal } = params;
    this.config = config;
    this.fetcher = fetcher;
    this.logger = logger;
    this.signal = signal;
    this.#fetched = [];
    this.status = { status: 'ready' };
    this.#pointers = {
      fetching: null,
      lastFetched: null,
      returning: null,
      lastReturned: null
    };
    this.#nextPromises = [];
    this.#sleeper = null;
    this.#noSleep = false;
  }

  isFetchingMultiple() {
    return this.#isFetchingMultiplePosts(this.config.postFetch);
  }

  getTargetType() {
    return this.#isFetchingMultiplePosts(this.config.postFetch) ? 'posts' : 'post';
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.logger, level, this.name, ...msg);
  }

  #setStatus(status: PostsFetcherStatus) {
    const oldStatus = this.status;
    this.status = status;
    this.emit('statusChange', { current: status, old: oldStatus });
  }

  #isRunning() {
    return this.status.status === 'running';
  }

  begin() {
    void this.#doBegin();
  }

  async #doBegin() {
    if (this.status.status !== 'ready') {
      throw Error('PostsFetcher already running or has ended');
    }

    this.#setStatus({ status: 'running' });

    this.#pointers.fetching = 0;
    const postFetch = this.config.postFetch;
    let postsAPIURL: string;
    try {
      postsAPIURL = await this.#getInitialPostsAPIUL();
    }
    catch (error) {
      this.#handleError(error);
      return;
    }
    if (this.#isFetchingMultiplePosts(postFetch)) {
      this.log('info', 'Fetch posts');
      this.log('debug', `Request initial posts from API URL "${postsAPIURL}"`);
    }
    else {
      this.log('info', 'Fetch target post');
      this.log('debug', `Request post #${postFetch.postId} from API URL "${postsAPIURL}`);
    }

    let json;
    try {
      json = await this.#fetchAPI(postsAPIURL);
    }
    catch (error) {
      this.#handleError(error);
      return;
    }

    const postsParser = new PostParser(this.logger);
    const collection = postsParser.parsePostsAPIResponse(json, postsAPIURL);
    this.#fetched = [ collection ];
    this.#pointers.lastFetched = this.#pointers.fetching;
    this.#pointers.fetching = null;
    this.emit('fetched', { collection, index: 0 });

    const total = this.#total = this.#fetched[0].total;
    if (this.#isFetchingMultiplePosts(postFetch)) {
      let totalFetched = this.#fetched[0].items.length;
      this.log('info', `Fetched posts: ${totalFetched} / ${total}`);
      let nextURL = this.#fetched[0].nextURL;
      while (nextURL) {
        let json;
        try {
          this.#pointers.fetching = this.#pointers.lastFetched !== null ? this.#pointers.lastFetched + 1 : 1;
          const sleep = !this.#pointers.returning || this.#pointers.returning < this.#pointers.fetching;
          if (sleep && !this.#sleeper) {
            this.log('debug', `Has more posts - will fetch in ${SLEEPER_INTERVAL / 1000} seconds`);
            this.#sleeper = Sleeper.getInstance(SLEEPER_INTERVAL, this.signal);
            await this.#sleeper.start();
          }
          this.log('debug', `Request more posts from API URL "${nextURL}"`);
          json = await this.#fetchAPI(nextURL);
        }
        catch (error) {
          this.#handleError(error);
          json = null;
        }
        finally {
          if (this.#sleeper) {
            this.#sleeper.destroy();
            this.#sleeper = null;
          }
        }
        if (!json) {
          nextURL = null;
        }
        else {
          const collection = postsParser.parsePostsAPIResponse(json, nextURL);
          this.#fetched.push(collection);
          const fetched = collection.items.length;
          totalFetched += fetched;
          this.log('info', `Fetched posts: ${totalFetched} / ${total}`);
          nextURL = collection.nextURL;
          this.#pointers.lastFetched = this.#pointers.fetching;
          this.#pointers.fetching = null;
          this.emit('fetched', { collection, index: this.#fetched.length - 1 });
        }
      }
      if (!this.checkAbortSignal()) {
        if (total && totalFetched < total) {
          this.log('warn', `Done, but some posts were not fetched. Total expected: ${total}; currently fetched: ${totalFetched}`);
        }
        else {
          this.log('info', `Done. ${totalFetched} posts fetched`);
        }

        if (this.#isRunning()) {
          this.#setStatus({ status: 'completed' });
        }
      }
    }
    // Set 'completed' if not fetching multiple posts
    else if (!this.checkAbortSignal() && this.#isRunning()) {
      this.#setStatus({ status: 'completed' });
    }
  }

  #handleError(error: any) {
    const statusName = this.status.status;
    if (statusName === 'aborted' || statusName === 'completed') {
      return;
    }
    if (this.signal?.aborted) {
      this.log('warn', 'Abort');
      this.#setStatus({ status: 'aborted' });
      return;
    }
    this.log('error', error);
    this.#setStatus({ status: 'error', error });
  }

  #isFetchingMultiplePosts(postFetch: DownloaderConfig<Post>['postFetch']): postFetch is DownloaderConfig<Post>['postFetch'] & { type: 'byUser' | 'byUserId' | 'byCollection' } {
    return postFetch.type === 'byUser' || postFetch.type === 'byUserId' || postFetch.type === 'byCollection';
  }

  async #getInitialPostsAPIUL() {
    const postFetch = this.config.postFetch;
    if (this.#isFetchingMultiplePosts(postFetch)) {
      const pageURL = this.#getInitialDataPageURL();
      const { campaignId, currentUserId } = await this.getInitialData(pageURL);
      let sort: PostSortOrder | undefined;
      if (postFetch.type === 'byCollection') {
        sort = PostSortOrder.CollectionOrder;
      }

      return URLHelper.constructPostsAPIURL({
        campaignId,
        currentUserId: this.config.include.lockedContent ? undefined : currentUserId,
        filters: postFetch.filters,
        sort
      });
    }

    return URLHelper.constructPostsAPIURL({ postId: postFetch.postId });
  }

  #getInitialDataPageURL() {
    const postFetch = this.config.postFetch;
    switch (postFetch.type) {
      case 'byUser':
        return URLHelper.constructCampaignPageURL({ vanity: postFetch.vanity });
      case 'byUserId':
        return URLHelper.constructCampaignPageURL({ userId: postFetch.userId });
      case 'byCollection':
        return URLHelper.constructCollectionURL(postFetch.collectionId);
      default:
        throw Error(`postFetch type mismatch: expecting 'byUser', 'byUserId' or 'byCollection' but got '${postFetch.type}'`);
    }
  }

  async getInitialData(url: string) {
    this.log('debug', `Fetch initial data from "${url}"`);
    let page;
    let fetchCurrentUserIdFromAPI = false;
    try {
      const { html, lastUrl } = await this.fetcher.get({ url, type: 'html', maxRetries: this.config.request.maxRetries, signal: this.signal });
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
      if (this.signal?.aborted) {
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
    const campaignId = ObjectHelper.getProperty(initialData, 'pageBootstrap.campaign.data.id');
    let currentUserId = ObjectHelper.getProperty(initialData, 'commonBootstrap.currentUser.data.id');
    if (!campaignId) {
      throw Error(`Campaign ID not found in initial data of "${url}"`);
    }
    if (fetchCurrentUserIdFromAPI) {
      this.log('debug', `Fetch current user ID from API`);
      const currentUserAPIURL = URLHelper.constructCurrentUserAPIURL();
      const { json: currentUserJson } = await this.fetcher.get({
        url: currentUserAPIURL,
        type: 'json',
        maxRetries: this.config.request.maxRetries,
        signal: this.signal
      });
      currentUserId = ObjectHelper.getProperty(currentUserJson, 'data.id') || undefined;
    }
    this.log('debug', `Initial data: campaign ID '${campaignId}'; current user ID '${currentUserId}'`);
    return { campaignId, currentUserId };
  }

  async #fetchPageWithPuppeteer(url: string) {
    return this.fetcher.getPageWithPuppeteer(url);
  }

  async #fetchAPI(url: string) {
    return (await this.fetcher.get({ url, type: 'json', maxRetries: this.config.request.maxRetries, signal: this.signal })).json;
  }

  protected checkAbortSignal() {
    return this.signal && this.signal.aborted;
  }

  hasNext() {
    const lastReturned = this.#pointers.lastReturned !== null ? this.#pointers.lastReturned : -1;
    return this.#isRunning() || (this.#fetched.length > 0 && lastReturned < this.#fetched.length - 1);
  }

  async next(): Promise<PostsFetcherResult> {
    this.#pointers.returning = this.#pointers.lastReturned !== null ? this.#pointers.lastReturned + 1 : 0;
    const ptr = this.#pointers.returning;
    this.log('debug', `next() requested (${ptr})`);
    const __parseStatus = (status: PostsFetcherStatus) => {
      let collection: PostCollection | null | undefined;
      let aborted = false;
      let error: any;
      switch (status.status) {
        case 'aborted':
          collection = null;
          aborted = true;
          break;
        case 'error':
          if (this.#fetched[ptr]) {
            collection = this.#fetched[ptr];
          }
          else {
            collection = null;
            error = status.error;
          }
          break;
        case 'completed':
          collection = this.#fetched[ptr] || null;
          break;
        default:
          collection = this.#fetched[ptr] || undefined;
      }
      return { collection, aborted, error };
    };
    if (this.#isRunning() && !this.#fetched[ptr]) {
      let result = this.#nextPromises[ptr];
      if (!result) {
        let resolved = false;
        result = new Promise<PostsFetcherResult>((resolve) => {
          const fetchedListener = () => {
            if (resolved) {
              this.off('fetched', fetchedListener);
              return;
            }
            if (this.#fetched[ptr]) {
              this.off('fetched', fetchedListener);
              resolved = true;
              resolve({
                collection: this.#fetched[ptr],
                aborted: false
              });
            }
          };
          const statusListener = (args: { current: PostsFetcherStatus }) => {
            if (resolved) {
              this.off('statusChange', statusListener);
              return;
            }
            const { collection, aborted, error } = __parseStatus(args.current);
            if (collection !== undefined) {
              this.off('statusChange', statusListener);
              resolved = true;
              resolve({ collection, aborted, error });
            }
          };
          this.on('fetched', fetchedListener);
          this.on('statusChange', statusListener);
          if (!this.#noSleep) {
            this.#noSleep = true;
          }
          if (this.#sleeper) {
            this.log('debug', 'Wake up early from sleep');
            this.#sleeper.wake();
          }
        })
          .finally(() => {
            this.#nextPromises[ptr] = undefined;
            this.#noSleep = false;
            this.#pointers.lastReturned = this.#pointers.returning;
            this.#pointers.returning = null;
            if (resolved) {
              this.log('debug', `next() handled (${ptr})`);
            }
            else {
              this.log('debug', `next() handled (${ptr}) - no resolve`);
            }
          });
        this.#nextPromises[ptr] = result;
      }
      return result;
    }
    this.#pointers.lastReturned = this.#pointers.returning;
    this.#pointers.returning = null;
    this.log('debug', `next() handled (${ptr})`);
    return __parseStatus(this.status);
  }

  getTotal() {
    return this.#total;
  }

  emit<T extends PostsFetcherEvent>(eventName: T, args: PostsFetcherEventPayload<T>): boolean;
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }

  on<T extends PostsFetcherEvent>(eventName: T, listener: (args: PostsFetcherEventPayload<T>) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  off<T extends PostsFetcherEvent>(eventName: T, listener: (args: PostsFetcherEventPayload<T>) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(eventName, listener);
  }
}
