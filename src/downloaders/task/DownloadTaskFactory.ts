import path from 'path';
import { type DummyMediaItem } from '../../entities/MediaItem.js';
import type Fetcher from '../../utils/Fetcher.js';
import MediaFilenameResolver from '../../utils/MediaFilenameResolver.js';
import {type DownloadTaskCallbacks} from './DownloadTask.js';
import DownloadTask from './DownloadTask.js';
import FetcherDownloadTask from './FetcherDownloadTask.js';
import { type Downloadable, isEmbed, isYouTubeEmbed } from '../../entities/Downloadable.js';
import { type EmbedDownloader, type FileExistsAction } from '../DownloaderOptions.js';
import type Logger from '../../utils/logging/Logger.js';
import YouTubeDownloadTask from './YouTubeDownloadTask.js';
import ExternalDownloaderTask from './ExternalDownloaderTask.js';
import { type DownloaderConfig } from '../Downloader.js';
import type Bottleneck from 'bottleneck';

const DEFAULT_IMAGE_URL_PRIORITY = [
  'original',
  'default',
  'download',
  'defaultSmall',
  'thumbnailLarge',
  'thumbnail',
  'thumbnailSmall'
];

const CAMPAIGN_COVER_PHOTO_URL_PRIORITY = [
  'xlarge',
  'large',
  'medium',
  'small',
  'xsmall'
];

const POST_COVER_IMAGE_URL_PRIORITY = [
  'large',
  'default',
  'thumb',
  'thumbSquareLarge',
  'thumbSquare'
];

const POST_THUMBNAIL_URL_PRIORITY = [
  'large2',
  'default',
  'large',
  'square'
];

const NULL_VARIANT = '/*NULL*/';

export default class DownloadTaskFactory {

  static #getSrcURLs(item: Downloadable, allVariants: boolean) {
    if (item.type === 'image') {
      let urls: Record<string, string | null> = {};
      let priority: string[] = [];
      switch (item.imageType) {
        case 'single':
          return {
            [NULL_VARIANT]: item.imageURL
          };
        case 'default':
          urls = {
            ...item.imageURLs,
            download: item.downloadURL
          };
          priority = DEFAULT_IMAGE_URL_PRIORITY;
          break;
        case 'campaignCoverPhoto':
          urls = item.imageURLs;
          priority = CAMPAIGN_COVER_PHOTO_URL_PRIORITY;
          break;
        case 'postCoverImage':
          urls = item.imageURLs;
          priority = POST_COVER_IMAGE_URL_PRIORITY;
          break;
        case 'postThumbnail':
          urls = item.imageURLs;
          priority = POST_THUMBNAIL_URL_PRIORITY;
          break;
      }
      if (allVariants) {
        return urls;
      }
      return this.#pickVariant(urls, priority);
    }
    else if (item.type === 'video') {
      let videoVariantName = 'display';
      if (item.size.width && item.size.height) {
        videoVariantName = `${item.size.width}x${item.size.height}`;
      }
      const urls = {
        download: item.downloadURL,
        [videoVariantName]: item.displayURLs.video
      };
      if (allVariants) {
        return urls;
      }
      const priority = [ 'download', videoVariantName ];
      return this.#pickVariant(urls, priority);
    }
    else if (item.type === 'audio') {
      return {
        [NULL_VARIANT]: item.url
      };
    }
    else if (item.type === 'file') {
      return {
        [NULL_VARIANT]: item.downloadURL
      };
    }
    else if (item.type === 'dummy') {
      return item.srcURLs;
    }
    else if (item.type === 'attachment') {
      return {
        [NULL_VARIANT]: item.downloadURL
      };
    }

    return {};
  }

  static async createFromDownloadable(params: {
    config: DownloaderConfig<any>,
    item: Downloadable,
    destDir: string,
    fetcher: Fetcher,
    fileExistsAction: FileExistsAction,
    callbacks?: DownloadTaskCallbacks | null,
    limiter: Bottleneck,
    signal?: AbortSignal,
    logger?: Logger | null;
  }) {

    const {
      config,
      item,
      destDir,
      fetcher,
      fileExistsAction,
      callbacks,
      limiter,
      signal,
      logger
    } = params;

    const embedDownloaders = config.embedDownloaders;
    const destFilenameFormat = config.filenameFormat.media;
    const downloadAllVariants = config.include.allMediaVariants;
    const tasks: DownloadTask[] = [];

    if (isEmbed(item)) {
      // Check if external downloader configured for embed item
      const embedDownloader = this.findEmbedDownloader(embedDownloaders, item.provider);
      if (embedDownloader) {
        const task = ExternalDownloaderTask.fromEmbedDownloader(config, embedDownloader, item, destDir, callbacks || null, logger);
        if (task) {
          tasks.push(task);
        }
      }
      // Use our own implementation if no external downloader configured for YT embeds
      else if (isYouTubeEmbed(item) && item.url) {
        tasks.push(await DownloadTask.create(YouTubeDownloadTask, {
          config,
          src: item.url,
          destDir,
          fileExistsAction,
          srcEntity: item,
          callbacks: callbacks || null,
          logger
        },
        limiter,
        signal));
      }
    }
    else {
      const srcURLs = this.#getSrcURLs(item, downloadAllVariants);
      for (const [ variant, url ] of Object.entries(srcURLs)) {
        const destFilenameResolver = 
          new MediaFilenameResolver(item, url, destFilenameFormat,
            variant !== NULL_VARIANT ? variant : null, downloadAllVariants);

        if (signal?.aborted) {
          return tasks;
        }

        if (url) {
          tasks.push(await DownloadTask.create(FetcherDownloadTask, {
            config,
            fetcher,
            src: url,
            destDir,
            destFilenameResolver,
            fileExistsAction,
            srcEntity: item,
            callbacks: callbacks || null,
            logger
          },
          limiter,
          signal));
        }
      }
    }    
    
    // Create a DownloadTask backed by a DummyMediaItem for video thumbnail
    if (item.type === 'video' && item.displayURLs.thumbnail) {
      let filename: string | null = null;
      if (item.filename) {
        // Video file extension not applicable to thumbnail, so strip it.
        filename = path.parse(item.filename).name;
      }
      const videoThumbnailMediaItem: DummyMediaItem = {
        type: 'dummy',
        id: item.id,
        filename,
        mimeType: null,
        srcURLs: {
          thumbnail: item.displayURLs.thumbnail
        }
      };
      const __config = {
        ...config,
        include: {
          ...config.include,
          allMediaVariants: true // Ensure variant name ('thumbnail') appears in dest filename
        }
      };
      tasks.push(
        ...await this.createFromDownloadable({
          config: __config,
          item: videoThumbnailMediaItem,
          destDir,
          fetcher,
          fileExistsAction,
          callbacks,
          limiter,
          signal,
          logger
        })
      );
    }

    if (tasks.length === 0) {
      throw Error('No src URL found');
    }

    return tasks;
  }

  static #pickVariant(urls: Record<string, any>, priority: string[]) {
    for (const variant of priority) {
      if (urls[variant]) {
        return {
          [variant]: urls[variant]
        };
      }
    }
    return {};
  }

  static findEmbedDownloader(edl: EmbedDownloader[], provider?: string | null) {
    return edl.find((dl) => dl.provider.toLowerCase() === provider?.trim().toLowerCase());
  }
}
