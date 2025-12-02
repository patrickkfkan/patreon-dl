import ProductParser from '../parsers/ProductParser.js';
import URLHelper from '../utils/URLHelper.js';
import Downloader, { type DownloaderConfig, type DownloaderStartParams } from './Downloader.js';
import StatusCache from './cache/StatusCache.js';
import { generateProductSummary } from './templates/ProductInfo.js';
import path from 'path';
import { TargetSkipReason } from './DownloaderEvent.js';
import { ProductType, type Product } from '../entities/Product.js';
import { type Downloadable } from '../entities/Downloadable.js';
import Bootstrap from './Bootstrap.js';
import ProductsFetcher from './ProductsFetcher.js';
import { type ProductDirectories } from '../utils/FSHelper.js';
import { type DBInstance } from '../browse/db/index.js';

export default class ProductDownloader extends Downloader<Product> {

  static version = '1.0.1';

  name = 'ProductDownloader';

  #startPromise: Promise<void> | null = null;

  doStart(params?: DownloaderStartParams): Promise<void> {

    if (this.#startPromise) {
      throw Error('Downloader already running');
    }

    this.#startPromise = this.#doStart(params)
      .finally(() => {
        this.#startPromise = null;
      });

    return this.#startPromise;
  }

  async #doStart(params?: DownloaderStartParams): Promise<void> {
    try {
      const { signal } = params || {};
      const productFetch = this.config.productFetch;
      const db = await this.db();

      if (this.checkAbortSignal(signal)) {
        return;
      }

      if (productFetch.type === 'byShop') {
        this.log('info', `Targeting products by '${productFetch.vanity}'`);
      }
      else {
        this.log('info', `Targeting product #${productFetch.productId}`);
      }

      // Step 1: get products (if by shop) or target product
      const productsFetcher = new ProductsFetcher({
        config: this.config,
        fetcher: this.fetcher,
        logger: this.logger,
        signal
      });
      productsFetcher.on('statusChange', ({current}) => {
        if (current.status === 'running') {
          this.emit('fetchBegin', { targetType: productsFetcher.getTargetType() });
        }
      });
      productsFetcher.begin();

      // Step 2: download products in each fetched list
      let downloaded = 0;
      let skippedUnviewable = 0;
      let skippedRedundant = 0;
      let skippedPublishDateOutOfRange = 0;
      let campaignSaved = false;
      let stopConditionMet = false;
      const productsParser = new ProductParser(this.logger);
      while (productsFetcher.hasNext()) {
        const { list, aborted, error } = await productsFetcher.next();
        if (!list || aborted) {
          break;
        }
        if (!list && error) {
          this.emit('end', { aborted: false, error, message: 'ProductsFetcher error' });
          return;
        }
        if (!campaignSaved && list.items[0]?.campaign) {
          await this.saveCampaignInfo(list.items[0].campaign, signal);
          campaignSaved = true;
          if (this.checkAbortSignal(signal)) {
            return;
          }
        }

        for (const _product of list.items) {

          if (stopConditionMet) {
            break;
          }

          let product = _product;

          if (this.#isFetchingMultipleProducts(productFetch)) {
            // Refresh to ensure media links have not expired
            this.log('debug', `Refresh product #${_product.id}`);
            const productURL = URLHelper.constructProductAPIURL(product.id);
            const { json } = await this.commonFetchAPI(productURL, signal);
            let refreshed: Product | null = null;
            if (json) {
              refreshed = productsParser.parseProductsAPIResponse(json, productURL).items[0] || null;
              if (!refreshed) {
                this.log('warn', `Refreshed product #${_product.id} but got empty value - going to use existing data`);
              }
              else if (refreshed.id !== _product.id) {
                this.log('warn', `Refreshed product #${_product.id} but ID mismatch - going to use existing data`);
                refreshed = null;
              }
              else {
                // Refreshed data does not have productType - reinstate it
                refreshed.productType = _product.productType;
              }
            }
            else if (this.checkAbortSignal(signal)) {
              return;
            }
            else {
              this.log('warn', `Failed to refresh product #${_product.id} - going to use existing data`);
            }
            if (refreshed) {
              this.log('debug', `Use refreshed product data #${refreshed.id}`);
              product = refreshed;
            }
          }

          this.emit('targetBegin', { target: product });

          // Step 4.1: product directories
          const productDirs = this.fsHelper.getProductDirs(product);
          this.log('debug', 'Product directories:', productDirs);

          // Step 4.2: Check with status cache
          const statusCache = StatusCache.getInstance(this.config, productDirs.statusCache, this.logger);
          if (!product.productType || product.productType === ProductType.DigitalCommerce) {
            const statusCacheValidation = statusCache.validate(product, productDirs.root, this.config)
            if (!statusCacheValidation.invalidated) {
              this.log('info', `Skipped downloading product #${product.id}: already downloaded`);
              this.emit('targetEnd', {
                target: product,
                isSkipped: true,
                skipReason: TargetSkipReason.AlreadyDownloaded,
                skipMessage: 'Target already downloaded'
              });
              skippedRedundant++;
              if (this.config.stopOn === 'previouslyDownloaded') {
                stopConditionMet = true;
              }
              continue;
            }
          }
          
          switch ((await this.#doDownload(
            product,
            productDirs,
            statusCache,
            db,
            signal
          )).status) {
            case 'aborted':
              return;
            case 'downloaded':
              downloaded++;
              break;
            case 'skippedPublishDateOutOfRange':
              skippedPublishDateOutOfRange++;
              if (this.config.stopOn === 'postPublishDateOutOfRange' ||
                this.config.stopOn === 'publishDateOutOfRange'
              ) {
                stopConditionMet = true;
              }
              break;
            case 'skippedUnviewable':
              skippedUnviewable++;
              break;
          }

          if (this.checkAbortSignal(signal)) {
            return;
          }
        }

        if (stopConditionMet) {
          break;
        }
      }

      if (this.checkAbortSignal(signal)) {
        return;
      }

      if (stopConditionMet && this.#isFetchingMultipleProducts(productFetch)) {
        this.log('info', `Stop downloader: stop condition "${this.config.stopOn}" met`)
      }

      // Done
      if (productFetch.type === 'byShop') {
        this.log('info', `Done downloading products by '${productFetch.vanity}'`);
      }
      else {
        this.log('info', `Done downloading product #${productFetch.productId}`);
      }
      let endMessage = 'Done';
      if (this.#isFetchingMultipleProducts(productFetch)) {
        const skippedStrParts: string[] = [];
        if (skippedUnviewable) {
          skippedStrParts.push(`${skippedUnviewable} unviewable`);
        }
        if (skippedRedundant) {
          skippedStrParts.push(`${skippedRedundant} redundant`);
        }
        if (skippedPublishDateOutOfRange) {
          skippedStrParts.push(`${skippedPublishDateOutOfRange} with publish date out of range`);
        }
        const skippedStr = skippedStrParts.length > 0 ? ` (skipped: ${skippedStrParts.join(', ')})` : '';
        endMessage = `Total ${downloaded} / ${productsFetcher.getTotal()} products processed${skippedStr}`;
        this.log('info', endMessage);
      }
      this.emit('end', { aborted: false, message: endMessage });
    }
    finally {
      await this.closeDB();
      if (this.logger) {
        await this.logger.end();
      }
    }
  }

  async #doDownload(
    product: Product,
    productDirs: ProductDirectories,
    statusCache: StatusCache,
    db: DBInstance,
    signal?: AbortSignal
  ): Promise<{status: 'skippedUnviewable' | 'skippedPublishDateOutOfRange' | 'aborted' | 'downloaded' }> {
    // Step 1: Check whether we should download product
    // -- 1.1 Accessibility
    if (!product.isAccessible) {
      if (this.config.include.lockedContent) {
        this.log('warn', `Product #${product.id} is not accessible by current user`);
      }
      else {
        this.log('warn', `Skipped downloading product #${product.id}: not accessible by current user`);
        this.emit('targetEnd', {
          target: product,
          isSkipped: true,
          skipReason: TargetSkipReason.Inaccessible,
          skipMessage: 'Target is not accessible by current user'
        });
        return {
          status: 'skippedUnviewable'
        };
      }
    }
    // -- 1.4 Config option 'include.productsPublished'
    if (this.isPublishDateOutOfRange(product)) {
      return {
        status: 'skippedPublishDateOutOfRange'
      };
    }

    this.fsHelper.createDir(productDirs.root);

    // Step 2: save product info
    if (this.config.include.contentInfo) {
      this.log('info', 'Save product info');
      this.emit('phaseBegin', { target: product, phase: 'saveInfo' });
      this.fsHelper.createDir(productDirs.info);
      const summary = generateProductSummary(product);
      const summaryFile = path.resolve(productDirs.info, 'info.txt');
      const saveSummaryResult = await this.fsHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
      this.logWriteTextFileResult(saveSummaryResult, product, 'product summary');

      const productRawFile = path.resolve(productDirs.info, 'product-api.json');
      const saveProductRawResult = await this.fsHelper.writeTextFile(
        productRawFile, product.raw, this.config.fileExistsAction.infoAPI);
      this.logWriteTextFileResult(saveProductRawResult, product, 'product API data');
      this.emit('phaseEnd', { target: product, phase: 'saveInfo' });
    }

    // Step 3: Download product media items
    const incPreview = this.config.include.previewMedia;
    const incContent = this.config.include.contentMedia;
    this.log('info', 'Download:', {
      ['preview items']: incPreview === true ? 'yes' : incPreview === false ? 'no' : JSON.stringify(incPreview),
      ['content items']: incContent === true ? 'yes' : incContent === false ? 'no' : JSON.stringify(incContent)
    });

    const __inc = (inc: boolean | Array<any>, target: Downloadable) => {
      if (typeof inc === 'boolean') {
        return inc;
      }
      return (inc.includes(target.type as any));
    };

    const previewMedia = product.previewMedia.filter((tt) => __inc(incPreview, tt));
    const contentMedia = product.contentMedia.filter((tt) => __inc(incContent, tt));
    const campaignDir = product.campaign ? this.fsHelper.getCampaignDirs(product.campaign).root : null;

    if (this.config.include.previewMedia || this.config.include.contentMedia) {
      this.emit('phaseBegin', { target: product, phase: 'saveMedia' });
      const batchResult = await this.createDownloadTaskBatch(
        `Product #${product.id} (${product.name})`,
        signal,

        previewMedia.length > 0 ? {
          target: previewMedia,
          targetName: `product #${product.id} -> preview media`,
          dirs: {
            campaign: campaignDir,
            main: productDirs.previewMedia,
            thumbnails: productDirs.thumbnails
          },
          fileExistsAction: this.config.fileExistsAction.content
        } : null,

        contentMedia.length > 0 ? {
          target: contentMedia,
          targetName: `product #${product.id} -> content media`,
          dirs: {
            campaign: campaignDir,
            main: productDirs.contentMedia,
            thumbnails: productDirs.thumbnails
          },
          fileExistsAction: this.config.fileExistsAction.content,
          ignoreCreateTaskErrors: !product.isAccessible
        } : null
      );

      const { batch } = batchResult;

      const abortHandler = () => {
        void (async () => {
          this.log('info', 'Abort signal received');
          if (batch) {
            await batch.abort();
          }
        })();
      };
      if (signal) {
        signal.addEventListener('abort', abortHandler, { once: true });
      }
      
      try {
        if (this.checkAbortSignal(signal)) {
          return {
            status: 'aborted'
          };
        }
        
        batch.prestart();
        this.log('info', `Download batch created (#${batch.id}): ${batch.getTasks('pending').length} downloads pending`);
        this.emit('phaseBegin', { target: product, phase: 'batchDownload', batch });

        await batch.start();

        // Step 4: Update status cache
        statusCache.updateOnDownload(product, productDirs.root, batch.getTasks('error').length > 0 || batchResult.errorCount > 0, this.config);

        await batch.destroy();
      }
      finally {
        if (signal) {
          signal.removeEventListener('abort', abortHandler);
        }
      }

      this.emit('phaseEnd', { target: product, phase: 'batchDownload' });
      this.emit('phaseEnd', { target: product, phase: 'saveMedia' });
    }

    if (this.checkAbortSignal(signal)) {
      return {
        status: 'aborted'
      };
    }

    // Step 5: Save to DB
    let skipDB = false;
    let saveReferencedEntityId: (id: string) => void;
    const dbProduct = db.getContent(product.id, 'product');
    if (!product.isAccessible) {
      // Skip if existing db record (if any) refers to accessible product
      skipDB = dbProduct !== null && dbProduct.isAccessible;
    }
    if (!skipDB) {
      db.saveContent(product);
      saveReferencedEntityId = (id) => {
        product.referencedEntityId = id;
        db.saveContent(product);
      };
    }
    else {
      this.log('info', `Skip overwrite existing accessible product #${product.id} in DB with current unviewable version`);
      saveReferencedEntityId = (id) => {
        // Ensure referencedEntityId is updated
        dbProduct!.referencedEntityId = id;
        db.saveContent(dbProduct!);
      };
    }

    // Step 6: check product type and download referenced product / collection
    await this.#processProductType(product, saveReferencedEntityId, signal);

    // Done
    this.log('info', `Done downloading product #${product.id}`);
    this.emit('targetEnd', { target: product, isSkipped: false });

    return {
      status: 'downloaded'
    }
  }

  // Carry out further action based on product type
  async #processProductType(
    product: Product,
    saveReferencedEntityId: (id: string) => void,
    signal?: AbortSignal
  ) {
    if (product.productType === undefined || product.productType === ProductType.DigitalCommerce) {
      this.log('debug', `Product type "${product.productType}": no further action required`);
      return;
    }
    if (product.productType === ProductType.Post || product.productType === ProductType.Collection) {
      const bootstrap = Bootstrap.getDownloaderBootstrapDataByURL(product.url);
      if (bootstrap?.type === 'post') {
        this.log('info', `Download ${product.productType} referenced by product: ${product.url}`);
        const PostDownloader = (await import('./PostDownloader.js')).default;
        const downloader = new PostDownloader(
          {
            ...this.config,
            ...bootstrap
          },
          this.db,
          this.logger,
          {
            skipSaveCampaign: true,
            keepLoggerOpen: true,
            keepDBOpen: true
          }
        );
        try {
          await downloader.start({ signal });
          this.log('info', `Done downloading ${product.productType} referenced by product`);
        }
        catch (error) {
          if (signal?.aborted) {
            throw error;
          }
          this.log('error', `Error downloading ${product.productType} referenced by product (url: ${product.url})`, error);
        }
        let referencedEntityId: string | undefined = undefined;
        let bootstrapMismatch = false;
        if (bootstrap.postFetch.type === 'single') {
          bootstrapMismatch = product.productType !== ProductType.Post;
          referencedEntityId = bootstrap.postFetch.postId;
        }
        if (bootstrap.postFetch.type === 'byCollection') {
          bootstrapMismatch = product.productType !== ProductType.Collection;
          referencedEntityId = bootstrap.postFetch.collectionId;
        }
        if (bootstrapMismatch) {
          this.log('warn', `Product type "${product.productType}" does not match URL "${product.url}" (${bootstrap.postFetch.type})`);
        }
        else if (referencedEntityId) {
          saveReferencedEntityId(referencedEntityId);
        }
      }
      else {
        this.log('error', `Product type is "${product.productType}" but could not create downloader from URL "${product.url}"`);
      }
      return;
    }
    this.log('debug', `Unknown product type "${product.productType}": no further action can be taken`);
    return;
  }

  #isFetchingMultipleProducts(productFetch: DownloaderConfig<Product>['productFetch']): productFetch is DownloaderConfig<Product>['productFetch'] & { type: 'byShop' } {
    return productFetch.type === 'byShop';
  }
}
