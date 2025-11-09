import ProductParser from '../parsers/ProductParser.js';
import URLHelper from '../utils/URLHelper.js';
import Downloader, { type DownloaderStartParams } from './Downloader.js';
import type DownloadTaskBatch from './task/DownloadTaskBatch.js';
import StatusCache from './cache/StatusCache.js';
import { generateProductSummary } from './templates/ProductInfo.js';
import path from 'path';
import { TargetSkipReason } from './DownloaderEvent.js';
import { type Product } from '../entities/Product.js';
import { type Downloadable } from '../entities/Downloadable.js';

export default class ProductDownloader extends Downloader<Product> {

  static version = '1.0.1';

  name = 'ProductDownloader';

  #startPromise: Promise<void> | null = null;

  doStart(params?: DownloaderStartParams): Promise<void> {

    if (this.#startPromise) {
      throw Error('Downloader already running');
    }

    this.#startPromise = new Promise<void>((resolve) => {
      void (async () => {
        const { signal } = params || {};
        let batch: DownloadTaskBatch | null = null;
        const db = await this.db();
  
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
  
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
  
        this.log('info', `Target product ID '${this.config.productId}'`);
  
        // Step 1: get product API data
        const url = URLHelper.constructProductAPIURL(this.config.productId);
        this.log('debug', `Fetch product data from API URL "${url}"`);
        this.emit('fetchBegin', { targetType: 'product' });
  
        const { json, error: requestAPIError } = await this.commonFetchAPI(url, signal);
        if (!json) {
          if (this.checkAbortSignal(signal, resolve)) {
            return;
          }
          this.log('error', 'Failed to fetch product data');
          this.emit('end', { aborted: false, error: requestAPIError, message: 'API request error' });
          resolve();
          return;
        }
  
        // Step 2: parse product API data
        const productParser = new ProductParser(this.logger);
        const product = productParser.parseProductAPIResponse(json, url, this.config.productId);
  
        // Step 3: Save campaign info
        await this.saveCampaignInfo(product.campaign, signal);
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
  
        this.emit('targetBegin', { target: product });
  
        // Step 4: Product directories
        const productDirs = this.fsHelper.getProductDirs(product);
        this.log('debug', 'Product directories: ', productDirs);
  
        // Step 5: Check with status cache
        const statusCache = StatusCache.getInstance(this.config, productDirs.statusCache, this.logger);
        const statusCacheValidation = statusCache.validate(product, productDirs.root, this.config);
        this.log('debug', 'Status cache validation result:', statusCacheValidation);
        if (!statusCacheValidation.invalidated) {
          this.log('info', `Skipped downloading product #${product.id}: already downloaded and nothing has changed since last download`);
          this.emit('targetEnd', {
            target: product,
            isSkipped: true,
            skipReason: TargetSkipReason.AlreadyDownloaded,
            skipMessage: 'Target already downloaded and nothing has changed since last download'
          });
          this.emit('end', { aborted: false, message: 'Skipped - target already downloaded' });
          resolve();
          return;
        }
  
        // Step 6: Check accessibility
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
            this.emit('end', { aborted: false, message: 'Skipped - not accessible' });
            resolve();
            return;
          }
        }
  
        this.fsHelper.createDir(productDirs.root);
  
        // Step 7: save product info
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
  
        // Step 8: Download product media items
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
              fileExistsAction: this.config.fileExistsAction.content
            } : null
          );
          
          if (this.checkAbortSignal(signal, resolve)) {
            return;
          }
          
          batch = batchResult.batch;
          batch.prestart();
          this.log('info', `Download batch created (#${batch.id}): ${batch.getTasks('pending').length} downloads pending`);
          this.emit('phaseBegin', { target: product, phase: 'batchDownload', batch });
  
          await batch.start();
  
          // Step 9: Update status cache
          statusCache.updateOnDownload(product, productDirs.root, batch.getTasks('error').length > 0 || batchResult.errorCount > 0, this.config);
  
          await batch.destroy();
          batch = null;
          this.emit('phaseEnd', { target: product, phase: 'batchDownload' });
          this.emit('phaseEnd', { target: product, phase: 'saveMedia' });
        }
  
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }

        // Step 10: Save to DB
        let skipDB = false;
        if (!product.isAccessible) {
          // Skip if existing db record (if any) refers to accessible product
          const dbProduct = db.getContent(product.id, 'product');
          skipDB = dbProduct !== null && dbProduct.isAccessible;
        }
        if (!skipDB) {
          db.saveContent(product);
        }
        else {
          this.log('info', `Skip overwrite existing accessible product #${product.id} in DB with current unviewable version`);
        }
  
        // Done
        if (signal) {
          signal.removeEventListener('abort', abortHandler);
        }
        this.log('info', `Done downloading product #${product.id}`);
        this.emit('targetEnd', { target: product, isSkipped: false });
        this.emit('end', { aborted: false, message: 'Done' });
        this.#startPromise = null;
        resolve();
      })();
    })
    .finally(() => {
      void (async () => {
        await this.closeDB();
        if (this.logger) {
          await this.logger.end();
        }
        this.#startPromise = null;
      })();
    });

    return this.#startPromise;
  }
}
