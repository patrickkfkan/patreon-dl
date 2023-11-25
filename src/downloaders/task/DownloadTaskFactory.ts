import path from 'path';
import { DummyMediaItem } from '../../entities/MediaItem.js';
import Fetcher from '../../utils/Fetcher.js';
import MediaFilenameResolver from '../../utils/MediaFilenameResolver.js';
import DownloadTask, { DownloadTaskCallbacks } from './DownloadTask.js';
import FetcherDownloadTask from './FetcherDownloadTask.js';
import { Downloadable } from '../../entities/Downloadable.js';
import AttachmentFilenameResolver from '../../utils/AttachmentFilenameResolver.js';
import { FileExistsAction } from '../DownloaderOptions.js';
import Logger from '../../utils/logging/Logger.js';
import YouTubeDownloadTask from './YouTubeDownloadTask.js';

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

  static createFromDownloadable(params: {
    item: Downloadable,
    destDir: string,
    fetcher: Fetcher,
    destFilenameFormat: string,
    fileExistsAction: FileExistsAction,
    downloadAllVariants: boolean,
    maxRetries: number,
    callbacks?: DownloadTaskCallbacks | null,
    logger?: Logger | null;
  }) {

    const {
      item,
      destDir,
      fetcher,
      destFilenameFormat,
      fileExistsAction,
      downloadAllVariants,
      maxRetries,
      callbacks,
      logger
    } = params;

    const __getSrcURLs = () => {
      if (item.type === 'image') {
        let urls: Record<string, string | null> = {};
        let priority: string[] = [];
        switch (item.imageType) {
          case 'single':
            return {
              [`${NULL_VARIANT}`]: item.imageURL
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
        if (downloadAllVariants) {
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
          [`${videoVariantName}`]: item.displayURLs.video
        };
        if (downloadAllVariants) {
          return urls;
        }
        const priority = [ 'download', videoVariantName ];
        return this.#pickVariant(urls, priority);
      }
      else if (item.type === 'audio') {
        return {
          [`${NULL_VARIANT}`]: item.url
        };
      }
      else if (item.type === 'file') {
        return {
          [`${NULL_VARIANT}`]: item.downloadURL
        };
      }
      else if (item.type === 'dummy') {
        return item.srcURLs;
      }
      else if (item.type === 'attachment') {
        return {
          [`${NULL_VARIANT}`]: item.url
        };
      }
      else if (item.type === 'videoEmbed') {
        return {
          [`${NULL_VARIANT}`]: item.url
        };
      }
      return {};
    };


    const srcURLs = __getSrcURLs();

    const tasks: DownloadTask[] = [];
    for (const [ variant, url ] of Object.entries(srcURLs)) {
      if (item.type === 'videoEmbed') {
        if (url) {
          tasks.push(new YouTubeDownloadTask({
            src: url,
            maxRetries,
            destDir,
            fileExistsAction,
            srcEntity: item,
            callbacks: callbacks || null,
            logger
          }));
        }
      }
      else {
        const destFilenameResolver = item.type === 'attachment' ?
          new AttachmentFilenameResolver(item, url, destFilenameFormat) :
          new MediaFilenameResolver(item, url, destFilenameFormat,
            variant !== NULL_VARIANT ? variant : null, downloadAllVariants);

        if (url) {
          tasks.push(new FetcherDownloadTask<Downloadable>({
            fetcher,
            src: url,
            maxRetries,
            destDir,
            destFilenameResolver,
            fileExistsAction,
            srcEntity: item,
            callbacks: callbacks || null,
            logger
          }));
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
      tasks.push(
        ...this.createFromDownloadable({
          item: videoThumbnailMediaItem,
          destDir,
          fetcher,
          destFilenameFormat,
          fileExistsAction,
          downloadAllVariants: true, // Ensure variant name ('thumbnail') appears in dest filename
          maxRetries,
          callbacks,
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
          [`${variant}`]: urls[variant]
        };
      }
    }
    return {};
  }

}
