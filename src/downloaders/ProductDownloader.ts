import ProductParser from '../parsers/ProductParser.js';
import FSHelper from '../utils/FSHelper.js';
import URLHelper from '../utils/URLHelper.js';
import Downloader, { DownloaderStartParams } from './Downloader.js';
import DownloadTaskBatch from './task/DownloadTaskBatch.js';
import StatusCache from './cache/StatusCache.js';
import { generateProductSummary } from './templates/ProductInfo.js';
import path from 'path';
import { TargetSkipReason } from './DownloaderEvent.js';

export default class ProductDownloader extends Downloader<'product'> {

  static version = '1.0.0';

  name = 'ProductDownloader';

  #startPromise: Promise<void> | null = null;

  start(params?: DownloaderStartParams): Promise<void> {

    if (this.#startPromise) {
      throw Error('Downloader already running');
    }

    this.#startPromise = new Promise<void>(async (resolve) => {

      const { signal } = params || {};
      let batch: DownloadTaskBatch | null = null;

      if (this.checkAbortSignal(signal, resolve)) {
        return;
      }

      const abortHandler = async () => {
        this.log('info', 'Abort signal received');
        if (batch) {
          await batch.abort();
        }
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
        this.emit('end', { aborted: false, error: requestAPIError });
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
      const productDirs = FSHelper.getProductDirs(product, this.config);
      this.log('debug', 'Product directories: ', productDirs);

      // Step 5: Check with status cache
      const statusCache = StatusCache.getInstance(productDirs.statusCache, this.logger, this.config.useStatusCache);
      if (statusCache.validate(product, productDirs.root, this.config)) {
        this.log('info', `Skipped downloading product #${product.id}: already downloaded and nothing has changed since last download`);
        this.emit('targetEnd', {
          target: product,
          isSkipped: true,
          skipReason: TargetSkipReason.AlreadyDownloaded,
          skipMessage: 'Target already downloaded and nothing has changed since last download'
        });
        this.emit('end', { aborted: false });
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
          this.emit('end', { aborted: false });
          resolve();
          return;
        }
      }

      FSHelper.createDir(productDirs.root);

      // Step 7: save product info
      if (this.config.include.contentInfo) {
        this.log('info', 'Save product info');
        this.emit('phaseBegin', { target: product, phase: 'saveInfo' });
        FSHelper.createDir(productDirs.info);
        const summary = generateProductSummary(product);
        const summaryFile = path.resolve(productDirs.info, 'info.txt');
        const saveSummaryResult = await FSHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
        this.logWriteTextFileResult(saveSummaryResult, product, 'product summary');

        const productRawFile = path.resolve(productDirs.info, 'product-api.json');
        const saveProductRawResult = await FSHelper.writeTextFile(
          productRawFile, product.raw, this.config.fileExistsAction.infoAPI);
        this.logWriteTextFileResult(saveProductRawResult, product, 'product API data');
        this.emit('phaseEnd', { target: product, phase: 'saveInfo' });
      }

      // Step 8: Download product media items
      this.log('info', 'Download: ' +
          `preview items: ${this.config.include.previewMedia ? 'yes' : 'no'}; ` +
          `content items: ${this.config.include.contentMedia ? 'yes' : 'no'}`);

      if (this.config.include.previewMedia || this.config.include.contentMedia) {
        this.emit('phaseBegin', { target: product, phase: 'saveMedia' });
        batch = this.createDownloadTaskBatch(
          `Product #${product.id} (${product.name})`,

          this.config.include.previewMedia ? {
            target: product.previewMedia,
            targetName: `product #${product.id} -> preview media`,
            destDir: productDirs.previewMedia,
            fileExistsAction: this.config.fileExistsAction.content
          } : null,

          this.config.include.contentMedia ? {
            target: product.contentMedia,
            targetName: `product #${product.id} -> content media`,
            destDir: productDirs.contentMedia,
            fileExistsAction: this.config.fileExistsAction.content
          } : null
        );

        this.log('info', `Download batch created (#${batch.id}): ${batch.getTasks('pending').length} downloads pending`);
        this.emit('phaseBegin', { target: product, phase: 'batchDownload', batch });

        await batch.start();

        // Step 9: Update status cache
        statusCache.updateOnDownload(product, productDirs.root, batch.getTasks('error').length > 0, this.config);

        await batch.destroy();
        batch = null;
        this.emit('phaseEnd', { target: product, phase: 'batchDownload' });
        this.emit('phaseEnd', { target: product, phase: 'saveMedia' });
      }

      if (this.checkAbortSignal(signal, resolve)) {
        return;
      }

      // Done
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }
      this.log('info', `Done downloading product #${product.id}`);
      this.emit('targetEnd', { target: product, isSkipped: false });
      this.emit('end', { aborted: false });
      this.#startPromise = null;
      resolve();
    })
      .finally(async () => {
        if (this.logger) {
          await this.logger.end();
        }
        this.#startPromise = null;
      });

    return this.#startPromise;
  }
}
