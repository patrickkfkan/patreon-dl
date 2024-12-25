import fse from 'fs-extra';
import { type Post } from '../../entities/Post.js';
import { major as semverMajor, minor as semverMinor } from 'semver';
import dateFormat from 'dateformat';
import { type Product } from '../../entities/Product.js';
import {type LogLevel} from '../../utils/logging/Logger.js';
import type Logger from '../../utils/logging/Logger.js';
import { commonLog } from '../../utils/logging/Logger.js';
import ObjectHelper from '../../utils/ObjectHelper.js';
import ProductDownloader from '../ProductDownloader.js';
import PostDownloader from '../PostDownloader.js';
import path from 'path';
import FSHelper from '../../utils/FSHelper.js';
import { type DownloaderConfig } from '../Downloader.js';

export interface StatusCacheData {
  products: Record<string, StatusCacheEntry<Product>>;
  posts: Record<string, StatusCacheEntry<Post>>;
}

export type StatusCacheTarget = Product | Post;

export type StatusCacheConfigIncludes<T extends StatusCacheTarget> = {
  lockedContent: boolean;
  contentInfo: boolean;
  previewMedia: DownloaderConfig<T>['include']['previewMedia'];
  contentMedia: DownloaderConfig<T>['include']['contentMedia'];
  allMediaVariants: boolean;
} & (
  T extends Post ? {
    comments: boolean;
  } : {}
);

export interface StatusCacheEntry<T extends StatusCacheTarget> {
  type: T['type'];
  downloaderVersion: string;
  lastDownloaded: string;
  lastDownloadHasErrors: boolean;
  lastDownloadConfig: {
    include: StatusCacheConfigIncludes<T>
  };
  lastDestDir: string;
  lastTargetInfo: StatusCacheTargetInfo<T>;
}

export type StatusCacheValidationResult<T extends StatusCacheTarget> = {
  invalidated: false;
  scope?: undefined;
} | {
  invalidated: true;
  scope: StatusCacheValidationScope<T>;
};

export type StatusCacheValidationScope<T extends StatusCacheTarget> =
  T extends Post ? ('post' | 'comments')[] :
  T extends Product ? ('product')[] :
  never;

const STATUS_CACHE_FILENAME = 'status-cache.json';
const INSTANCE_CACHE_SIZE = 5;

export type StatusCacheTargetInfo<T extends Product | Post> =
  {
    id: T['id'];
  } & (
    T extends Post ? {
      isViewable: T['isViewable'];
      editedAt: T['editedAt'];
      commentCount: T['commentCount'];
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
  #fsHelper: FSHelper;

  constructor(config: DownloaderConfig<any>, statusCacheDir: string, logger?: Logger | null) {
    this.#logger = logger;
    this.#fsHelper = new FSHelper(config, logger);

    const file = path.resolve(statusCacheDir, STATUS_CACHE_FILENAME);
    let data: StatusCacheData;
    if (fse.existsSync(file)) {
      data = fse.readJSONSync(file);
      this.log('debug', `Loaded status cache file "${file}"`);
    }
    else {
      this.#fsHelper.createDir(statusCacheDir);
      this.log('debug', `"${file}" does not exist. Start with empty data`);
      data = {
        products: {},
        posts: {}
      };
    }

    const enabled = config.useStatusCache;
    if (!enabled) {
      this.log('debug', 'Status cache entry validation disabled');
    }

    this.#dir = statusCacheDir;
    this.#file = file;
    this.#data = data;
    this.#enabled = enabled;
  }

  static getInstance(config: DownloaderConfig<any>, statusCacheDir: string, logger?: Logger | null) {
    const enabled = config.useStatusCache;
    const cachedInstance = this.#instances.find(
      (sc) => sc.#dir === statusCacheDir && sc.#logger === logger && sc.#enabled === enabled);
    if (cachedInstance) {
      return cachedInstance;
    }
    const instance = new StatusCache(config, statusCacheDir, logger);
    this.#instances.push(instance);
    if (this.#instances.length > INSTANCE_CACHE_SIZE) {
      this.#instances.shift();
    }
    return instance;
  }

  #validationResult<T extends StatusCacheTarget> (target: T, invalidated: boolean, scope?: StatusCacheValidationScope<T>): StatusCacheValidationResult<T> {
    if (!invalidated) {
      return {
        invalidated: false
      };
    }
    if (this.#isTargetType(target, 'post')) {
      const result: StatusCacheValidationResult<Post> = {
        invalidated: true,
        scope: scope ? scope as StatusCacheValidationScope<Post> : ['post', 'comments']
      };
      return result as StatusCacheValidationResult<T>;
    }
    if (this.#isTargetType(target, 'product')) {
      const result: StatusCacheValidationResult<Product> = {
        invalidated: true,
        scope: scope ? scope as StatusCacheValidationScope<Product> : ['product']
      };
      return result as StatusCacheValidationResult<T>;
    }
    throw Error('Unknown target');
  }

  validate(target: Post, destDir: string, config: DownloaderConfig<any>): StatusCacheValidationResult<Post>;
  validate(target: Product, destDir: string, config: DownloaderConfig<any>): StatusCacheValidationResult<Product>;
  validate<T extends StatusCacheTarget>(target: T, destDir: string, config: DownloaderConfig<any>) {
    
    if (!this.#enabled) {     
      return this.#validationResult(target, true);
    }

    const entry = this.#getCacheEntry(target);

    if (!entry) {
      this.log('debug', `Status cache entry does not exist for ${target.type} #${target.id}`);
      return this.#validationResult(target, true);
    }

    this.log('debug', `Validate status cache entry for ${target.type} #${target.id}; last downloaded: ${entry.lastDownloaded}; dest dir: "${entry.lastDestDir}"`);

    if (!entry.lastDestDir) {
      this.log('debug', '-> Invalidated: \'lastDestDir\' missing in status cache entry');
      return this.#validationResult(target, true);
    }
    // `entry.lastDestDir` is relative to the dir of status cache. Resolve to absolute.
    const lastDestDir = path.resolve(this.#dir, entry.lastDestDir);
    if (lastDestDir !== destDir) {
      this.log('debug', `-> Invalidated: destination directory has changed from "${lastDestDir}" to "${destDir}"`);
      return this.#validationResult(target, true);
    }
    if (!fse.existsSync(lastDestDir)) {
      this.log('debug', `-> Invalidated: destination directory "${lastDestDir}" does not exist`);
      return this.#validationResult(target, true);
    }

    const downloaderVer =
      this.#isTargetType(target, 'product') ? ProductDownloader.version :
        this.#isTargetType(target, 'post') ? PostDownloader.version :
          null;
    if (downloaderVer && !this.#validateByDownloaderVer(entry.downloaderVersion, downloaderVer)) {
      this.log('debug', '-> Invalidated: downloader version has changed (major / minor)');
      return this.#validationResult(target, true);
    }

    if (entry.lastDownloadHasErrors) {
      this.log('debug', '-> Invalidated: last download has errors');
      return this.#validationResult(target, true);
    }

    if (!entry.lastDownloadConfig?.include) {
      this.log('debug', '-> Invalidated: \'lastDownloadConfig.include\' missing in status cache entry');
      return this.#validationResult(target, true);
    }

    const __compareConfigInclude = <K extends StatusCacheTarget>(prop: keyof StatusCacheConfigIncludes<T & K> & keyof DownloaderConfig<any>['include']) => {
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
      else if (Array.isArray(last) && now === true) {
        const nowEntries =
          prop === 'contentMedia' ? [ 'image', 'video', 'audio', 'attachment', 'file' ] :
            prop === 'previewMedia' ? [ 'image', 'video', 'audio' ] :
              null;
        if (nowEntries) {
          const notInlast = nowEntries.filter((v) => !last.includes(v as any));
          invalidated = notInlast.length > 0;
        }
        else {
          invalidated = true;
        }
      }

      if (invalidated) {
        this.log('debug', `-> Invalidated: downloader config 'include.${prop}' has changed from '${JSON.stringify(last)}' -> '${JSON.stringify(now)}'`);
      }

      return !invalidated;
    };

    const __compareConfigIncludes = <K extends StatusCacheTarget>(props: (keyof StatusCacheConfigIncludes<T & K> & keyof DownloaderConfig<any>['include'])[]) => {
      for (const prop of props) {
        if (!__compareConfigInclude(prop)) {
          return false;
        }
      }
      return true;
    }

    const baseIncludes = [ 'lockedContent', 'contentInfo', 'previewMedia', 'contentMedia', 'allMediaVariants' ] as const;
    const scope: StatusCacheValidationScope<any> = [];
    if (!__compareConfigIncludes([...baseIncludes])) {
      return this.#validationResult(target, true);
    }
    else if (this.#isTargetType(target, 'post') && !__compareConfigInclude<Post>('comments')) {
      return this.#validationResult<Post>(target, true, ['comments']);
    }
    if (!entry.lastTargetInfo) {
      this.log('debug', '-> Invalidated: \'lastTargetInfo\' missing in status cache entry');
      return this.#validationResult(target, true);
    }

    if (this.#isTargetType(target, 'post') && this.#isEntryType(entry, 'post')) {
      const invalidated =  this.#validatePostCacheEntry(entry, target);
      if (invalidated.length > 0) {
        return this.#validationResult<Post>(target, true, [...invalidated]);
      }
    }
    if (this.#isTargetType(target, 'product') && this.#isEntryType(entry, 'product')) {
      const invalidated = this.#validateProductCacheEntry(entry, target);
      if (invalidated.length > 0){
        return this.#validationResult<Product>(target, true, invalidated);
      }
    }

    this.log('debug', '-> Validated');
    return this.#validationResult(target, false);
  }

  #isTargetType(target: StatusCacheTarget, type: 'post'): target is Post;
  #isTargetType(target: StatusCacheTarget, type: 'product'): target is Product;
  #isTargetType<T extends StatusCacheTarget>(target: StatusCacheTarget, type: T['type']): target is T {
    return target.type === type;
  }

  #isEntryType(entry: StatusCacheEntry<any>, type: 'post'): entry is StatusCacheEntry<Post>;
  #isEntryType(entry: StatusCacheEntry<any>, type: 'product'): entry is StatusCacheEntry<Product>;
  #isEntryType<T extends StatusCacheTarget>(entry: StatusCacheEntry<any>, type: T['type']): entry is StatusCacheEntry<T> {
    return entry.type === type;
  }

  #validatePostCacheEntry(entry: StatusCacheEntry<Post>, post: Post) {
    const invalidated: Partial<Record<StatusCacheValidationScope<Post>[number], any>> = {};
    if (entry.lastTargetInfo.isViewable !== post.isViewable) {
      this.log('debug', `-> Invalidated: viewability has changed (before: ${entry.lastTargetInfo.isViewable}; now: ${post.isViewable})`);
      invalidated['post'] = 1;
    }
    if (entry.lastTargetInfo.editedAt !== post.editedAt) {
      this.log('debug', `-> Invalidated: post has been edited (before: ${entry.lastTargetInfo.editedAt}; now: ${post.editedAt})`);
      invalidated['post'] = 1;
    }
    if (entry.lastTargetInfo.commentCount !== post.commentCount) {
      this.log('debug', `-> Invalidated: comment cout of post has changed (before: ${entry.lastTargetInfo.commentCount}; now: ${post.commentCount})`);
      invalidated['comments'] = 1;
    }
    return Object.keys(invalidated) as StatusCacheValidationScope<Post>;
  }

  #validateProductCacheEntry(entry: StatusCacheEntry<Product>, product: Product) {
    const invalidated: Partial<Record<StatusCacheValidationScope<Product>[number], any>> = {};
    if (entry.lastTargetInfo.isAccessible !== product.isAccessible) {
      this.log('debug', `-> Invalidated: product accessibility has changed (before: ${entry.lastTargetInfo.isAccessible}; now: ${product.isAccessible})`);
      invalidated['product'] = 1;
    }
    return Object.keys(invalidated) as StatusCacheValidationScope<Product>;
  }

  #getCacheEntry<T extends StatusCacheTarget>(target: T): StatusCacheEntry<T> | null {
    const targetType = target['type'];
    const targetId = target['id'];
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

  updateOnDownload(target: Product | Post, destDir: string, downloadHasErrors: boolean, config: DownloaderConfig<any>) {
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
    if (this.#isTargetType(target, 'product')) {
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
    else if (this.#isTargetType(target, 'post')) {
      this.#data.posts[target.id] = {
        type: 'post',
        downloaderVersion: PostDownloader.version,
        ...commonData,
        lastDownloadConfig: {
          include: {
            ...commonData.lastDownloadConfig.include,
            comments: config.include.comments
          }
        },
        lastTargetInfo: {
          id: target.id,
          isViewable: target.isViewable,
          editedAt: target.editedAt,
          commentCount: target.commentCount
        }
      };
    }
    this.log('debug', `Update status cache for ${target.type} #${target.id}`);
    this.#fsHelper.writeJSON(this.#file, this.#data);
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.name, ...msg);
  }

}
