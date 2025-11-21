import EventEmitter from 'events';
import { type Campaign, type Product } from '../entities/index.js';
import { type Logger } from '../utils/logging/index.js';
import { type LogLevel, commonLog } from '../utils/logging/Logger.js';
import Downloader, { type DownloaderConfig } from './Downloader.js';
import URLHelper from '../utils/URLHelper.js';
import type Fetcher from '../utils/Fetcher.js';
import ProductParser from '../parsers/ProductParser.js';
import { type ProductList } from '../entities/Product.js';
import Sleeper from '../utils/Sleeper.js';
import { InitialData } from './InitialData.js';

export type ProductsFetcherStatus = {
  status: 'ready' | 'running' | 'completed' | 'aborted';
  error?: undefined;
} | {
  status: 'error';
  error: any;
};

export type ProductsFetcherEvent = 'fetched' | 'statusChange';
export type ProductsFetcherEventPayload<T extends ProductsFetcherEvent> =
  T extends 'fetched' ? {
    list: ProductList;
    index: number;
  } :
  T extends 'statusChange' ? {
    current: ProductsFetcherStatus;
    old: ProductsFetcherStatus;
  } :
  never;

export interface ProductsFetcherResult {
  list: ProductList | null;
  error?: any;
  aborted: boolean;
}

const SLEEPER_INTERVAL = 900000; // 15 mins

export default class ProductsFetcher extends EventEmitter {

  name = 'ProductsFetcher';

  protected status: ProductsFetcherStatus;
  protected config: DownloaderConfig<Product>;
  protected fetcher: Fetcher;
  protected signal?: AbortSignal;
  protected logger?: Logger | null;

  #pointers: {
    fetching: number | null;
    lastFetched: number | null;
    returning: number | null;
    lastReturned: number | null; // Last returned in next()
  };
  #fetched: ProductList[];
  #total: number | null;
  #nextPromises: Array<Promise<ProductsFetcherResult> | undefined>;
  #sleeper: Sleeper | null;
  #noSleep: boolean;

  constructor(params: {
    config: DownloaderConfig<Product>,
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
    return this.#isFetchingMultipleProducts(this.config.productFetch);
  }

  getTargetType() {
    return this.#isFetchingMultipleProducts(this.config.productFetch) ? 'products' : 'product';
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.logger, level, this.name, ...msg);
  }

  #setStatus(status: ProductsFetcherStatus) {
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
      throw Error('ProductsFetcher already running or has ended');
    }

    this.#setStatus({ status: 'running' });

    this.#pointers.fetching = 0;
    const productFetch = this.config.productFetch;
    let productsAPIURL: string;
    let campaign: Campaign | null;
    try {
      const ctx = await this.#getInitialContext();
      productsAPIURL = ctx.productsAPIURL;
      campaign = ctx.campaign;
    }
    catch (error) {
      this.#handleError(error);
      return;
    }
    if (this.#isFetchingMultipleProducts(productFetch)) {
      this.log('info', 'Fetch products');
      this.log('debug', `Request initial products from API URL "${productsAPIURL}"`);
    }
    else {
      this.log('info', 'Fetch target product');
      this.log('debug', `Request product #${productFetch.productId} from API URL "${productsAPIURL}`);
    }

    let json;
    try {
      json = await this.#fetchAPI(productsAPIURL);
    }
    catch (error) {
      this.#handleError(error);
      return;
    }

    const productsParser = new ProductParser(this.logger);
    const list = productsParser.parseProductsAPIResponse(json, productsAPIURL, campaign);
    this.#fetched = [ list ];
    this.#pointers.lastFetched = this.#pointers.fetching;
    this.#pointers.fetching = null;
    this.emit('fetched', { list, index: 0 });

    const total = this.#total = this.#fetched[0].total;
    if (this.#isFetchingMultipleProducts(productFetch)) {
      let totalFetched = this.#fetched[0].items.length;
      this.log('info', `Fetched products: ${totalFetched} / ${total}`);
      let nextURL = this.#fetched[0].nextURL;
      while (nextURL) {
        let json;
        try {
          this.#pointers.fetching = this.#pointers.lastFetched !== null ? this.#pointers.lastFetched + 1 : 1;
          const sleep = !this.#pointers.returning || this.#pointers.returning < this.#pointers.fetching;
          if (sleep && !this.#sleeper) {
            this.log('debug', `Has more products - will fetch in ${SLEEPER_INTERVAL / 1000} seconds`);
            this.#sleeper = Sleeper.getInstance(SLEEPER_INTERVAL, this.signal);
            await this.#sleeper.start();
          }
          this.log('debug', `Request more products from API URL "${nextURL}"`);
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
          const list = productsParser.parseProductsAPIResponse(json, nextURL);
          this.#fetched.push(list);
          const fetched = list.items.length;
          totalFetched += fetched;
          this.log('info', `Fetched products: ${totalFetched} / ${total}`);
          nextURL = list.nextURL;
          this.#pointers.lastFetched = this.#pointers.fetching;
          this.#pointers.fetching = null;
          this.emit('fetched', { list, index: this.#fetched.length - 1 });
        }
      }
      if (!this.checkAbortSignal()) {
        if (total && totalFetched < total) {
          this.log('warn', `Done, but some products were not fetched. Total expected: ${total}; currently fetched: ${totalFetched}`);
        }
        else {
          this.log('info', `Done. ${totalFetched} products fetched`);
        }

        if (this.#isRunning()) {
          this.#setStatus({ status: 'completed' });
        }
      }
    }
    // Set 'completed' if not fetching multiple products
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

  #isFetchingMultipleProducts(productFetch: DownloaderConfig<Product>['productFetch']): productFetch is DownloaderConfig<Product>['productFetch'] & { type: 'byShop' } {
    return productFetch.type === 'byShop';
  }

  async #getInitialContext() {
    const productFetch = this.config.productFetch;
    const pageURL = this.#getInitialDataPageURL();
    const { campaignId } = await this.getInitialData(pageURL);
    const apiURL = this.#isFetchingMultipleProducts(productFetch) ? 
      URLHelper.constructShopAPIURL({ campaignId })
      : URLHelper.constructProductAPIURL(productFetch.productId);
    // Products API does not return full campaign data (missing creator and rewards info),
    // so we fetch campaign separately.
    const campaign = await Downloader.getCampaign({ campaignId }, this.signal, this.config);
    return {
      productsAPIURL: apiURL,
      campaign
    };
  }

  #getInitialDataPageURL() {
    const productFetch = this.config.productFetch;
    switch (productFetch.type) {
      case 'byShop':
        return URLHelper.constructCampaignPageURL({ vanity: productFetch.vanity });
      default:
        throw Error(`productFetch type mismatch: expecting 'byShop' but got '${productFetch.type}'`);
    }
  }

  getInitialData(url: string) {
    const id = new InitialData(this.config, this.fetcher, this.logger);
    return id.get(url, this.signal);
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

  async next(): Promise<ProductsFetcherResult> {
    this.#pointers.returning = this.#pointers.lastReturned !== null ? this.#pointers.lastReturned + 1 : 0;
    const ptr = this.#pointers.returning;
    this.log('debug', `next() requested (${ptr})`);
    const __parseStatus = (status: ProductsFetcherStatus) => {
      let list: ProductList | null | undefined;
      let aborted = false;
      let error: any;
      switch (status.status) {
        case 'aborted':
          list = null;
          aborted = true;
          break;
        case 'error':
          if (this.#fetched[ptr]) {
            list = this.#fetched[ptr];
          }
          else {
            list = null;
            error = status.error;
          }
          break;
        case 'completed':
          list = this.#fetched[ptr] || null;
          break;
        default:
          list = this.#fetched[ptr] || undefined;
      }
      return { list, aborted, error };
    };
    if (this.#isRunning() && !this.#fetched[ptr]) {
      let result = this.#nextPromises[ptr];
      if (!result) {
        let resolved = false;
        result = new Promise<ProductsFetcherResult>((resolve) => {
          const fetchedListener = () => {
            if (resolved) {
              this.off('fetched', fetchedListener);
              return;
            }
            if (this.#fetched[ptr]) {
              this.off('fetched', fetchedListener);
              resolved = true;
              resolve({
                list: this.#fetched[ptr],
                aborted: false
              });
            }
          };
          const statusListener = (args: { current: ProductsFetcherStatus }) => {
            if (resolved) {
              this.off('statusChange', statusListener);
              return;
            }
            const { list, aborted, error } = __parseStatus(args.current);
            if (list !== undefined) {
              this.off('statusChange', statusListener);
              resolved = true;
              resolve({ list, aborted, error });
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

  emit<T extends ProductsFetcherEvent>(eventName: T, args: ProductsFetcherEventPayload<T>): boolean;
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }

  on<T extends ProductsFetcherEvent>(eventName: T, listener: (args: ProductsFetcherEventPayload<T>) => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  off<T extends ProductsFetcherEvent>(eventName: T, listener: (args: ProductsFetcherEventPayload<T>) => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(eventName, listener);
  }
}
