import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import makeDir from 'make-dir';
import sanitizeFilename from 'sanitize-filename';
import escapeStringRegexp from 'escape-string-regexp';
import hasha from 'hasha';
import { Product } from '../entities/Product.js';
import { Campaign } from '../entities/Campaign.js';
import { DownloaderConfig } from '../downloaders/Downloader.js';
import FilenameFormatHelper from './FilenameFormatHelper.js';
import { Post } from '../entities/Post.js';
import { FileExistsAction } from '../downloaders/DownloaderOptions.js';

const CAMPAIGN_FIXED_DIR_NAMES = {
  INFO: 'campaign_info'
};

const PRODUCT_FIXED_DIR_NAMES = {
  SHOP: 'shop',
  INFO: 'product_info',
  CONTENT_MEDIA: 'content_media',
  PREVIEW_MEDIA: 'preview_media'
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
  EMBED: 'embed'
};

const INTERNAL_DATA_DIR_NAME = '.patreon-dl';

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

  static getCampaignDirs(campaign: Campaign, config: DownloaderConfig<any>) {
    const dirName = FilenameFormatHelper.getCampaignDirName(campaign, config.dirNameFormat.campaign);
    const root = path.resolve(config.outDir, dirName);
    return {
      root,
      info: path.resolve(root, CAMPAIGN_FIXED_DIR_NAMES.INFO)
    };
  }

  static getPostDirs(post: Post, config: DownloaderConfig<Post>) {
    const dirName = FilenameFormatHelper.getContentDirName(post, config.dirNameFormat.content);
    let postRootPath: string;
    let statusCachePath: string;
    if (post.campaign) {
      const campaignRootDir = this.getCampaignDirs(post.campaign, config).root;
      const postsDir = this.createDir(path.resolve(campaignRootDir, POST_FIXED_DIR_NAMES.POSTS));
      postRootPath = path.resolve(postsDir, dirName);
      statusCachePath = path.resolve(campaignRootDir, INTERNAL_DATA_DIR_NAME);
    }
    else {
      postRootPath = path.resolve(config.outDir, dirName);
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
      statusCache: statusCachePath
    };
  }

  static getProductDirs(product: Product, config: DownloaderConfig<Product>) {
    const dirName = FilenameFormatHelper.getContentDirName(product, config.dirNameFormat.content);
    let productRootPath: string;
    let statusCachePath: string;
    if (product.campaign) {
      const campaignRootDir = this.getCampaignDirs(product.campaign, config).root;
      const shopDir = this.createDir(path.resolve(campaignRootDir, PRODUCT_FIXED_DIR_NAMES.SHOP));
      productRootPath = path.resolve(shopDir, dirName);
      statusCachePath = path.resolve(campaignRootDir, INTERNAL_DATA_DIR_NAME);
    }
    else {
      productRootPath = path.resolve(config.outDir, dirName);
      statusCachePath = path.resolve(productRootPath, INTERNAL_DATA_DIR_NAME);
    }
    return {
      root: productRootPath,
      info: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.INFO),
      contentMedia: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.CONTENT_MEDIA),
      previewMedia: path.resolve(productRootPath, PRODUCT_FIXED_DIR_NAMES.PREVIEW_MEDIA),
      statusCache: statusCachePath
    };
  }

  static createDir(dir: string, parents = true) {
    if (fs.existsSync(dir)) {
      if (!fs.lstatSync(dir).isDirectory()) {
        throw Error(`"${dir}" exists but is not a directory`);
      }
      return dir;
    }
    if (!parents) {
      fs.mkdirSync(dir);
      return dir;
    }

    return makeDir.sync(dir);

  }

  static checkFileExistsAndIncrement(file: string) {
    const { name, base, dir, ext } = path.parse(file);
    // Regex to match filename with increment: 'filename (number).ext'
    const regex = new RegExp(`^${escapeStringRegexp(name)} \\((\\d+?)\\)${escapeStringRegexp(ext)}$`, 'g');
    const files = fs.readdirSync(dir);
    let currentLargestInc = -1;
    let currentLargestIncFilename = base;
    for (const file of files) {
      const match = regex.exec(file);
      if (match && match[1] !== undefined && Number(match[1]) > currentLargestInc) {
        currentLargestInc = Number(match[1]);
        currentLargestIncFilename = file;
      }
      regex.lastIndex = 0;
    }

    if (currentLargestInc === -1) {
      if (!fs.existsSync(file)) {
        const fileParts = path.parse(file);
        return {
          filename: fileParts.base,
          filePath: path.resolve(file),
          preceding: null
        };
      }
      currentLargestInc = 0;
    }

    const _filename = `${name} (${currentLargestInc + 1})${ext}`;
    const _filePath = path.resolve(dir, _filename);

    return {
      filename: _filename,
      filePath: _filePath,
      preceding: path.resolve(dir, currentLargestIncFilename)
    };
  }

  static sanitizeFilePath(filePath: string) {
    const splitted = filePath.split(path.sep);
    const root = path.isAbsolute(filePath) ? splitted.shift() || '' : null;
    const sanitized = splitted.map((s) => sanitizeFilename(s));
    if (root !== null) {
      sanitized.unshift(root);
    }
    return sanitized.join(path.sep);
  }

  static async compareFiles(f1: string, f2: string) {
    const [ checksum1, checksum2 ] = await Promise.all([
      hasha.fromFile(f1, { algorithm: 'md5' }),
      hasha.fromFile(f2, { algorithm: 'md5' })
    ]);
    return checksum1 === checksum2;
  }

  static async writeTextFile(file: string, data: string | object, fileExistsAction: FileExistsAction): Promise<WriteTextFileResult> {
    const resolvedFile = {
      original: file,
      final: file,
      incrementedFrom: null as string | null
    };
    try {
      if (fs.existsSync(file)) {
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
      const tmpFile = `${resolvedFile.final}.part`;
      if (typeof data === 'object') {
        fse.writeJsonSync(tmpFile, data, { spaces: 2 });
      }
      else {
        fs.writeFileSync(tmpFile, data);
      }
      if (fileExistsAction === 'saveAsCopyIfNewer' &&
        resolvedFile.incrementedFrom && fs.existsSync(resolvedFile.incrementedFrom)) {

        const filesMatch = await this.compareFiles(tmpFile, resolvedFile.incrementedFrom);
        if (filesMatch) {
          fs.unlinkSync(tmpFile);
          return {
            status: 'skipped',
            message: `Destination file exists with same content (${resolvedFile.incrementedFrom})`
          };
        }
      }

      fs.renameSync(tmpFile, resolvedFile.final);
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

  static changeFilePathExtension(filePath: string, extension: `.${string}`) {
    const filePathParts = {
      ...path.parse(filePath),
      base: undefined,
      ext: extension
    };
    return path.format(filePathParts);
  }
}
