import fse from 'fs-extra';
import { Post } from '../../entities/Post.js';
import { major as semverMajor, minor as semverMinor } from 'semver';
import dateFormat from 'dateformat';
import { Product } from '../../entities/Product.js';
import Logger, { LogLevel, commonLog } from '../../utils/logging/Logger.js';
import ObjectHelper from '../../utils/ObjectHelper.js';
import ProductDownloader from '../ProductDownloader.js';
import PostDownloader from '../PostDownloader.js';
import path from 'path';
import FSHelper from '../../utils/FSHelper.js';
import { DownloaderConfig } from '../Downloader.js';

export interface StatusCacheData {
  products: Record<string, StatusCacheEntry<Product>>;
  posts: Record<string, StatusCacheEntry<Post>>;
}

export interface StatusCacheEntry<T extends Product | Post> {
  type: T['type'];
  downloaderVersion: string;
  lastDownloaded: string;
  lastDownloadHasErrors: boolean;
  lastDownloadConfig: {
    include: {
      lockedContent: boolean;
      contentInfo: boolean;
      previewMedia: DownloaderConfig<T>['include']['previewMedia'];
      contentMedia: DownloaderConfig<T>['include']['contentMedia'];
      allMediaVariants: boolean;
    };
  };
  lastDestDir: string;
  lastTargetInfo: StatusCacheTargetInfo<T>;
}

const STATUS_CACHE_FILENAME = 'status-cache.json';
const INSTANCE_CACHE_SIZE = 5;

export type StatusCacheTargetInfo<T extends Product | Post> =
  {
    id: T['id'];
  } & (
    T extends Post ? {
      isViewable: T['isViewable'];
      editedAt: T['editedAt'];
    } :
    T extends Product ? {
      isAccessible: T['isAccessible'];
    } :
    {}
  )

export default class StatusCache {

  name: 'StatusCache';

  static #instances: StatusCache[] = [];

  #dir: string;
  #file: string;
  #data: StatusCacheData;
  #logger?: Logger | null;
  #enabled: boolean;

  constructor(statusCacheDir: string, logger: Logger | null | undefined, enabled: boolean) {
    this.#logger = logger;

    const file = path.resolve(statusCacheDir, STATUS_CACHE_FILENAME);
    let data: StatusCacheData;
    if (fse.existsSync(file)) {
      data = fse.readJSONSync(file);
      this.log('debug', `Loaded status cache file "${file}"`);
    }
    else {
      FSHelper.createDir(statusCacheDir);
      this.log('debug', `"${file}" does not exist. Start with empty data`);
      data = {
        products: {},
        posts: {}
      };
    }
    if (!enabled) {
      this.log('debug', 'Status cache entry validation disabled');
    }

    this.#dir = statusCacheDir;
    this.#file = file;
    this.#data = data;
    this.#enabled = enabled;
  }

  static getInstance(statusCacheDir: string, logger?: Logger | null, enabled = true) {
    const cachedInstance = this.#instances.find(
      (sc) => sc.#dir === statusCacheDir && sc.#logger === logger && sc.#enabled === enabled);
    if (cachedInstance) {
      return cachedInstance;
    }
    const instance = new StatusCache(statusCacheDir, logger, enabled);
    this.#instances.push(instance);
    if (this.#instances.length > INSTANCE_CACHE_SIZE) {
      this.#instances.shift();
    }
    return instance;
  }

  validate<T extends Product | Post>(target: T, destDir: string, config: DownloaderConfig<any>) {
    if (!this.#enabled) {
      return false;
    }

    const entry =
      target.type === 'product' ? this.#getCacheEntry(target.id, 'product') :
        target.type === 'post' ? this.#getCacheEntry(target.id, 'post') :
          null;

    if (!entry) {
      this.log('debug', `Status cache entry does not exist for ${target.type} #${target.id}`);
      return false;
    }

    this.log('debug', `Validate status cache entry for ${target.type} #${target.id}; last downloaded: ${entry.lastDownloaded}; dest dir: "${entry.lastDestDir}"`);

    if (!entry.lastDestDir) {
      this.log('debug', '-> Invalidated: \'lastDestDir\' missing in status cache entry');
      return false;
    }
    // `entry.lastDestDir` is relative to the dir of status cache. Resolve to absolute.
    const lastDestDir = path.resolve(this.#dir, entry.lastDestDir);
    if (lastDestDir !== destDir) {
      this.log('debug', `-> Invalidated: destination directory has changed from "${lastDestDir}" to "${destDir}"`);
      return false;
    }
    if (!fse.existsSync(lastDestDir)) {
      this.log('debug', `-> Invalidated: destination directory "${lastDestDir}" does not exist`);
      return false;
    }

    const downloaderVer =
      target.type === 'product' ? ProductDownloader.version :
        target.type === 'post' ? PostDownloader.version :
          null;
    if (downloaderVer && !this.#validateByDownloaderVer(entry.downloaderVersion, downloaderVer)) {
      this.log('debug', '-> Invalidated: downloader version has changed (major / minor)');
      return false;
    }

    if (entry.lastDownloadHasErrors) {
      this.log('debug', '-> Invalidated: last download has errors');
      return false;
    }

    if (!entry.lastDownloadConfig?.include) {
      this.log('debug', '-> Invalidated: \'lastDownloadConfig.include\' missing in status cache entry');
      return false;
    }

    const __compareConfigInclude = (prop: keyof StatusCacheEntry<T>['lastDownloadConfig']['include'] & keyof DownloaderConfig<T>['include']) => {
      const last = entry.lastDownloadConfig.include[prop];
      const now = config.include[prop];

      let invalidated = false;
      // Only invalidate if 'now' scope is wider
      if (!last && now !== false) { // 'false' -> something truthy ('true' or array of values)
        invalidated = true;
      }
      else if (Array.isArray(last) && Array.isArray(now)) {
        // 'now' scope is wider if it contains entries not present in 'last'
        const notInlast = now.filter((v) => !last.includes(v as any));
        invalidated = notInlast.length > 0;
      }

      if (invalidated) {
        this.log('debug', `-> Invalidated: downloader config 'include.${prop}' has changed from '${JSON.stringify(last)}' -> '${JSON.stringify(now)}'`);
      }

      return !invalidated;
    };

    const includeProps: Array<keyof StatusCacheEntry<T>['lastDownloadConfig']['include']> =
      [ 'lockedContent', 'contentInfo', 'previewMedia', 'contentMedia', 'allMediaVariants' ];
    for (const prop of includeProps) {
      if (!__compareConfigInclude(prop)) {
        return false;
      }
    }

    if (!entry.lastTargetInfo) {
      this.log('debug', '-> Invalidated: \'lastTargetInfo\' missing in status cache entry');
      return false;
    }

    if (target.type === 'post' && entry.type === 'post' && !this.#validatePostCacheEntry(entry, target)) {
      return false;
    }
    if (target.type === 'product' && entry.type === 'product' && !this.#validateProductCacheEntry(entry, target)) {
      return false;
    }

    this.log('debug', '-> Validated');
    return true;
  }

  #validatePostCacheEntry(entry: StatusCacheEntry<Post>, post: Post) {
    if (entry.lastTargetInfo.isViewable !== post.isViewable) {
      this.log('debug', `-> Invalidated: viewability has changed (before: ${entry.lastTargetInfo.isViewable}; now: ${post.isViewable})`);
      return false;
    }
    if (entry.lastTargetInfo.editedAt !== post.editedAt) {
      this.log('debug', `-> Invalidated: post has been edited (before: ${entry.lastTargetInfo.editedAt}; now: ${post.editedAt})`);
      return false;
    }
    return true;
  }

  #validateProductCacheEntry(entry: StatusCacheEntry<Product>, product: Product) {
    if (entry.lastTargetInfo.isAccessible !== product.isAccessible) {
      this.log('debug', `-> Invalidated: product accessibility has changed (before: ${entry.lastTargetInfo.isAccessible}; now: ${product.isAccessible})`);
      return false;
    }
    return true;
  }

  #getCacheEntry(targetId: string, targetType: 'post'): StatusCacheEntry<Post> | null;
  #getCacheEntry(targetId: string, targetType: 'product'): StatusCacheEntry<Product> | null;
  #getCacheEntry(targetId: string, targetType: 'product' | 'post') {
    const key = targetType === 'product' ? `products.${targetId}` : `posts.${targetId}`;
    return ObjectHelper.getProperty(this.#data, key) || null;
  }

  #validateByDownloaderVer(entryValue: string, currentValue: string) {
    if (!entryValue) {
      return false;
    }
    return semverMajor(entryValue) === semverMajor(currentValue) &&
      semverMinor(entryValue) === semverMinor(currentValue);
  }

  updateOnDownload<T extends Product | Post>(target: T, destDir: string, downloadHasErrors: boolean, config: DownloaderConfig<any>) {
    const commonData = {
      lastDownloaded: dateFormat('isoDateTime'),
      lastDownloadHasErrors: downloadHasErrors,
      // Convert `destDir` to path relative to status cache dir
      lastDestDir: path.relative(this.#dir, destDir),
      lastDownloadConfig: {
        include: {
          lockedContent: config.include.lockedContent,
          contentInfo: config.include.contentInfo,
          previewMedia: config.include.previewMedia,
          contentMedia: config.include.contentMedia,
          allMediaVariants: config.include.allMediaVariants
        }
      }
    };
    if (target.type === 'product') {
      this.#data.products[target.id] = {
        type: 'product',
        downloaderVersion: ProductDownloader.version,
        ...commonData,
        lastTargetInfo: {
          id: target.id,
          isAccessible: target.isAccessible
        }
      };
    }
    else if (target.type === 'post') {
      this.#data.posts[target.id] = {
        type: 'post',
        downloaderVersion: PostDownloader.version,
        ...commonData,
        lastTargetInfo: {
          id: target.id,
          isViewable: target.isViewable,
          editedAt: target.editedAt
        }
      };
    }
    this.log('debug', `Update status cache for ${target.type} #${target.id}`);
    fse.writeJsonSync(this.#file, this.#data, { spaces: 2 });
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.name, ...msg);
  }

}
