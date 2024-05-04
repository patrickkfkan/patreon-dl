import path from 'path';
import Logger from '../utils/logging/Logger.js';
import { DeepRequired, pickDefined } from '../utils/Misc.js';

export type FileExistsAction = 'overwrite' | 'skip' | 'saveAsCopy' | 'saveAsCopyIfNewer';

export interface DownloaderIncludeOptions {
  lockedContent?: boolean;
  postsWithMediaType?: Array<'image' | 'video' | 'audio' | 'attachment'> | 'any' | 'none';
  postsInTier?: Array<string> | 'any';
  campaignInfo?: boolean;
  contentInfo?: boolean;
  previewMedia?: boolean | Array<'image' | 'video' | 'audio'>;
  contentMedia?: boolean | Array<'image' | 'video' | 'audio' | 'attachment' | 'file'>;
  allMediaVariants?: boolean;
}

export interface DownloaderOptions {
  cookie?: string;
  useStatusCache?: boolean;
  pathToFFmpeg?: string | null;
  pathToYouTubeCredentials?: string | null;
  outDir?: string;
  dirNameFormat?: {
    campaign?: string;
    content?: string;
  };
  filenameFormat?: {
    media?: string;
  }
  include?: DownloaderIncludeOptions;
  request?: {
    maxRetries?: number;
    maxConcurrent?: number;
    minTime?: number;
  };
  fileExistsAction?: {
    content?: FileExistsAction;
    info?: FileExistsAction;
    infoAPI?: FileExistsAction;
  }
  logger?: Logger | null;
}

export type DownloaderInit = DeepRequired<Pick<DownloaderOptions,
  'outDir' |
  'useStatusCache' |
  'pathToFFmpeg' |
  'pathToYouTubeCredentials' |
  'dirNameFormat' |
  'filenameFormat' |
  'include' |
  'request' |
  'fileExistsAction'>>;

const DEFAULT_DOWNLOADER_INIT: DeepRequired<DownloaderInit> = {
  outDir: process.cwd(),
  useStatusCache: true,
  pathToFFmpeg: null,
  pathToYouTubeCredentials: null,
  dirNameFormat: {
    campaign: '{creator.vanity}[ - ]?{campaign.name}',
    content: '{content.id}[ - ]?{content.name}'
  },
  filenameFormat: {
    media: '{media.filename}'
  },
  include: {
    lockedContent: true,
    postsWithMediaType: 'any',
    postsInTier: 'any',
    campaignInfo: true,
    contentInfo: true,
    previewMedia: true,
    contentMedia: true,
    allMediaVariants: false
  },
  request: {
    maxRetries: 3,
    maxConcurrent: 10,
    minTime: 333
  },
  fileExistsAction: {
    content: 'skip',
    info: 'saveAsCopyIfNewer',
    infoAPI: 'overwrite'
  }
};

export function getDownloaderInit(options?: DownloaderOptions): DownloaderInit {
  const defaults = DEFAULT_DOWNLOADER_INIT;
  return {
    outDir: options?.outDir ? path.resolve(options.outDir) : defaults.outDir,
    useStatusCache: pickDefined(options?.useStatusCache, defaults.useStatusCache),
    pathToFFmpeg: pickDefined(options?.pathToFFmpeg, defaults.pathToFFmpeg),
    pathToYouTubeCredentials: pickDefined(options?.pathToYouTubeCredentials, defaults.pathToYouTubeCredentials),
    dirNameFormat: {
      campaign: options?.dirNameFormat?.campaign || defaults.dirNameFormat.campaign,
      content: options?.dirNameFormat?.content || defaults.dirNameFormat.content
    },
    filenameFormat: {
      media: options?.filenameFormat?.media || defaults.filenameFormat.media
    },
    include: {
      lockedContent: pickDefined(options?.include?.lockedContent, defaults.include.lockedContent),
      postsWithMediaType: pickDefined(options?.include?.postsWithMediaType, defaults.include.postsWithMediaType),
      postsInTier: pickDefined(options?.include?.postsInTier, defaults.include.postsInTier),
      campaignInfo: pickDefined(options?.include?.campaignInfo, defaults.include.campaignInfo),
      contentInfo: pickDefined(options?.include?.contentInfo, defaults.include.contentInfo),
      previewMedia: pickDefined(options?.include?.previewMedia, defaults.include.previewMedia),
      contentMedia: pickDefined(options?.include?.contentMedia, defaults.include.contentMedia),
      allMediaVariants: pickDefined(options?.include?.allMediaVariants, defaults.include.allMediaVariants)
    },
    request: {
      maxRetries: pickDefined(options?.request?.maxRetries, defaults.request.maxRetries),
      maxConcurrent: pickDefined(options?.request?.maxConcurrent, defaults.request.maxConcurrent),
      minTime: pickDefined(options?.request?.minTime, defaults.request.minTime)
    },
    fileExistsAction: {
      content: options?.fileExistsAction?.content || defaults.fileExistsAction.content,
      info: options?.fileExistsAction?.info || defaults.fileExistsAction.info,
      infoAPI: options?.fileExistsAction?.infoAPI || defaults.fileExistsAction.infoAPI
    }
  };
}

export function getDefaultDownloaderOutDir() {
  return DEFAULT_DOWNLOADER_INIT.outDir;
}