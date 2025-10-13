import path from 'path';
import fse from 'fs-extra';
import makeDir from 'make-dir';
import _sanitizeFilename from 'sanitize-filename';
import escapeStringRegexp from 'escape-string-regexp';
import hasha from 'hasha';
import { type Product } from '../entities/Product.js';
import { type Campaign } from '../entities/Campaign.js';
import { type DownloaderConfig } from '../downloaders/Downloader.js';
import FilenameFormatHelper from './FilenameFormatHelper.js';
import { type Post } from '../entities/Post.js';
import { type FileExistsAction } from '../downloaders/DownloaderOptions.js';
import {type LogLevel} from './logging/Logger.js';
import type Logger from './logging/Logger.js';
import { commonLog } from './logging/Logger.js';

const CAMPAIGN_FIXED_DIR_NAMES = {
  INFO: 'campaign_info'
};

const PRODUCT_FIXED_DIR_NAMES = {
  SHOP: 'shop',
  INFO: 'product_info',
  CONTENT_MEDIA: 'content_media',
  PREVIEW_MEDIA: 'preview_media',
  THUMBNAILS: '.thumbnails'
};

const POST_FIXED_DIR_NAMES = {
  POSTS: 'posts',
  INFO: 'post_info',
  AUDIO: 'audio',
  VIDEO: 'video',
  IMAGES: 'images',
  AUDIO_PREVIEW: 'audio_preview',
  VIDEO_PREVIEW: 'video_preview',
  IMAGE_PREVIEWS: 'image_previews',
  ATTACHMENTS: 'attachments',
  EMBED: 'embed',
  THUMBNAILS: '.thumbnails'
};

export interface PostDirectories {
  root: string;
  info: string;
  audio: string;
  video: string;
  images: string;
  audioPreview: string;
  videoPreview: string;
  imagePreviews: string;
  attachments: string;
  embed: string;
  thumbnails: string;
  statusCache: string;
}

const INTERNAL_DATA_DIR_NAME = '.patreon-dl';
const DB_FILENAME = 'db.sqlite';

export type WriteTextFileResult = {
  status: 'completed';
  filePath: string;
} | {
  status: 'skipped';
  message: string;
} | {
  status: 'error';
  filePath: string;
  error: any
};

export default class FSHelper {

  name = 'FSHelper';

  protected config: DownloaderConfig<any>;
  protected logger?: Logger | null;

  constructor(config: DownloaderConfig<any>, logger?: Logger | null) {
    this.config = config;
    this.logger = logger;
  }

  getDBFilePath() {
    const dbDir = this.createDir(path.resolve(this.config.outDir, INTERNAL_DATA_DIR_NAME));
    return path.resolve(dbDir, DB_FILENAME);
  }

  getCampaignDirs(campaign: Campaign) {
    const dirName = FilenameFormatHelper.getCampaignDirName(campaign, this.config.dirNameFormat.campaign);
    const root = path.resolve(this.config.outDir, dirName);
    return {
      root,
      info: path.resolve(root, CAMPAIGN_FIXED_DIR_NAMES.INFO)
    };
  }

  getPostDirs(post: Post): PostDirectories {
    const dirName = FilenameFormatHelper.getContentDirName(post, this.config.dirNameFormat.content);
    let postRootPath: string;
    let statusCachePath: string;
    if (post.campaign) {
      const campaignRootDir = this.getCampaignDirs(post.campaign).root;
      const postsDir = this.createDir(path.resolve(campaignRootDir, POST_FIXED_DIR_NAMES.POSTS));
      postRootPath = path.resolve(postsDir, dirName);
      statusCachePath = path.resolve(campaignRootDir, INTERNAL_DATA_DIR_NAME);
    }
    else {
      postRootPath = path.resolve(this.config.outDir, dirName);
      statusCachePath = path.resolve(postRootPath, INTERNAL_DATA_DIR_NAME);
    }
    return {
      root: postRootPath,
      info: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.INFO),
      audio: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.AUDIO),
      video: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.VIDEO),
      images: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.IMAGES),
      audioPreview: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.AUDIO_PREVIEW),
      videoPreview: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.VIDEO_PREVIEW),
      imagePreviews: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.IMAGE_PREVIEWS),
      attachments: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.ATTACHMENTS),
      embed: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.EMBED),
      thumbnails: path.resolve(postRootPath, POST_FIXED_DIR_NAMES.THUMBNAILS),
      statusCache: statusCachePath
    };
  }

  getProductDirs(product: Product) {
    const dirName = FilenameFormatHelper.getContentDirName(product, this.config.dirNameFormat.content);
    let productRootPath: string;
    let statusCachePath: string;
    if (product.campaign) {
      const campaignRootDir = this.getCampaignDirs(product.campaign).root;
      const shopDir = this.createDir(path.resolve(campaignRootDir, PRODUCT_FIXED_DIR_NAMES.SHOP));
      productRootPath = path.resolve(shopDir, dirName);
      statusCachePath = path.resolve(campaignRootDir, INTERNAL_DATA_DIR_NAME);
    }
    else {
      productRootPath = path.resolve(this.config.outDir, dirName);
      statusCachePath = path.resolve(productRootPath, INTERNAL_DATA_DIR_NAME);
    }
    return {
      root: productRootPath,
      info: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.INFO),
      contentMedia: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.CONTENT_MEDIA),
      previewMedia: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.PREVIEW_MEDIA),
      thumbnails: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.THUMBNAILS),
      statusCache: statusCachePath
    };
  }

  /**
   * Check whether a path refers to a directory, or a symlink which resolves to
   * a directory
   */
  private isDirectory(path: string): boolean {
    if (!fse.existsSync(path)) {
      return false;
    }
    const resolved = fse.realpathSync(path);
    if (!fse.existsSync(resolved)) {
      return false;
    }
    const stat = fse.lstatSync(resolved);
    return stat.isDirectory();
  }

  createDir(dir: string, parents = true) {
    if (fse.existsSync(dir)) {
      if (!this.isDirectory(dir)) {
        throw Error(`"${dir}" exists but is not a directory`);
      }
      return dir;
    }

    if (this.config.dryRun) {
      this.log('debug', `(dry-run) Create directory "${dir}"`);
      return dir;
    }

    return FSHelper.createDir(dir, parents);
  }

  static createDir(dir: string, parents = true) {
    if (!parents) {
      fse.mkdirSync(dir);
      return dir;
    }
    return makeDir.sync(dir);
  }

  checkFileExistsAndIncrement(file: string) {
    const { name, base, dir, ext } = path.parse(file);
    // Regex to match filename with increment: 'filename (number).ext'
    //Const regex = new RegExp(`^${escapeStringRegexp(name)} \\((\\d+?)\\)${escapeStringRegexp(ext)}$`, 'g');
    const regex = new RegExp(`(.+) \\((\\d+?)\\)${escapeStringRegexp(ext)}$`, 'g');
    let currentLargestInc = -1;
    let currentLargestIncFilename = base;
    const files = this.readdir(dir);
    for (const _file of files) {
      const match = regex.exec(_file);
      if (match && match[1] !== undefined) {
        const filename = match[0];
        const num = Number(match[1]);
        if (
          (filename === base ||
          (filename.length >= (255 - match[1].length - 1) && base.length >= 255 && base.startsWith(filename))) &&
          num > currentLargestInc
        ) {
          currentLargestInc = Number(match[1]);
          currentLargestIncFilename = _file;
        }
      }
      regex.lastIndex = 0;
    }

    if (currentLargestInc === -1) {
      if (!fse.existsSync(file)) {
        const fileParts = path.parse(file);
        return {
          filename: fileParts.base,
          filePath: path.resolve(file),
          preceding: null
        };
      }
      currentLargestInc = 0;
    }

    const _filename = FSHelper.createFilename({
      name,
      suffix: ` (${currentLargestInc + 1})`,
      ext
    });
    const _filePath = path.resolve(dir, _filename);

    return {
      filename: _filename,
      filePath: _filePath,
      preceding: path.resolve(dir, currentLargestIncFilename)
    };
  }

  static createFilename(parts: { name: string, suffix?: string, ext?: string }) {
    const { name, suffix = '', ext = '' } = parts;
    const sanitizedName = _sanitizeFilename(name);
    const sanitizedSuffix = _sanitizeFilename(suffix);
    const sanitizedExt = _sanitizeFilename(ext);
    const useName = sanitizedName.substring(0, 255 - sanitizedSuffix.length - sanitizedExt.length);
    return [ useName, sanitizedSuffix, sanitizedExt ].join('');
  }

  static createTmpFilePath(filePath: string, prefix = '') {
    const { dir, base } = path.parse(filePath);
    const tmpFilename = this.createFilename({ name: `${prefix ? `${prefix}-` : ''}${base}`, ext: '.part' });
    return path.resolve(dir, tmpFilename);
  }

  static sanitizeFilename(filename: string) {
    const { name, ext } = path.parse(filename);
    return this.createFilename({ name, ext });
  }

  async compareFiles(f1: string, f2: string) {
    if (this.config.dryRun) {
      this.log('debug', '(dry-run) Compare files: return true');
      return true;
    }
    const [ checksum1, checksum2 ] = await Promise.all([
      hasha.fromFile(f1, { algorithm: 'md5' }),
      hasha.fromFile(f2, { algorithm: 'md5' })
    ]);
    return checksum1 === checksum2;
  }

  async writeTextFile(file: string, data: string | object, fileExistsAction: FileExistsAction): Promise<WriteTextFileResult> {
    const resolvedFile = {
      original: file,
      final: file,
      incrementedFrom: null as string | null
    };
    try {
      if (fse.existsSync(file)) {
        if (fileExistsAction === 'skip') {
          return {
            status: 'skipped',
            message: `Destination file exists (${file})`
          };
        }
        if (fileExistsAction === 'saveAsCopy' || fileExistsAction === 'saveAsCopyIfNewer') {
          const checked = this.checkFileExistsAndIncrement(file);
          resolvedFile.final = checked.filePath;
          resolvedFile.incrementedFrom = checked.preceding;
        }
      }
      const tmpFile = FSHelper.createTmpFilePath(resolvedFile.final);
      if (typeof data === 'object') {
        this.writeJSON(tmpFile, data);
      }
      else {
        this.writeFile(tmpFile, data);
      }
      if (fileExistsAction === 'saveAsCopyIfNewer' &&
        resolvedFile.incrementedFrom && fse.existsSync(resolvedFile.incrementedFrom)) {

        const filesMatch = await this.compareFiles(tmpFile, resolvedFile.incrementedFrom);
        if (filesMatch) {
          this.unlink(tmpFile);
          return {
            status: 'skipped',
            message: `Destination file exists with same content (${resolvedFile.incrementedFrom})`
          };
        }
      }

      this.rename(tmpFile, resolvedFile.final);
      return {
        status: 'completed',
        filePath: resolvedFile.final
      };
    }
    catch (error) {
      return {
        status: 'error',
        filePath: resolvedFile.final,
        error
      };
    }
  }

  changeFilePathExtension(filePath: string, extension: `.${string}`) {
    const filePathParts = {
      ...path.parse(filePath),
      base: undefined,
      ext: extension
    };
    return path.format(filePathParts);
  }

  readdir(dir: string) {
    if (!this.config.dryRun || fse.existsSync(dir)) {
      return fse.readdirSync(dir);
    }
    return [];
  }

  writeFile(file: string, data: string) {
    if (!this.config.dryRun) {
      FSHelper.writeFile(file, data);
    }
    else {
      this.log('debug', `(dry-run) Write text "${file}"`);
    }
  }

  static writeFile(file: string, data: string) {
    fse.writeFileSync(file, data);
  }

  writeJSON(file: string, data: any) {
    if (!this.config.dryRun) {
      FSHelper.writeJSON(file, data);
    }
    else {
      this.log('debug', `(dry-run) Write JSON "${file}"`);
    }
  }

  static writeJSON(file: string, data: any) {
    fse.writeJsonSync(file, data, { spaces: 2 });
  }

  unlink(file: string) {
    if (!this.config.dryRun) {
      FSHelper.unlink(file);
    }
    else {
      this.log('debug', `(dry-run) Unlink "${file}"`);
    }
  }

  static unlink(file: string) {
    fse.unlinkSync(file);
  }

  rename(oldPath: string, newPath: string) {
    if (!this.config.dryRun) {
      FSHelper.rename(oldPath, newPath);
    }
    else {
      this.log('debug', `(dry-run) Rename "${oldPath}" -> "${newPath}"`);
    }
  }

  static rename(oldPath: string, newPath: string) {
    fse.renameSync(oldPath, newPath);
  }

  protected log(level: LogLevel, ...msg: Array<any>) {
    commonLog(this.logger, level, this.name, ...msg);
  }
}
