import path from 'path';
import type Logger from '../utils/logging/Logger.js';
import { type DeepRequired, pickDefined } from '../utils/Misc.js';
import type DateTime from '../utils/DateTime.js';

export type FileExistsAction = 'overwrite' | 'skip' | 'saveAsCopy' | 'saveAsCopyIfNewer';
export type StopOnCondition = 'never' | 'postPreviouslyDownloaded' | 'postPublishDateOutOfRange';

export interface DownloaderIncludeOptions {
  lockedContent?: boolean;
  postsWithMediaType?: Array<'image' | 'video' | 'audio' | 'attachment' | 'podcast'> | 'any' | 'none';
  postsInTier?: Array<string> | 'any';
  postsPublished?: {
    after?: DateTime | null;
    before?: DateTime | null;
  };
  campaignInfo?: boolean;
  contentInfo?: boolean;
  previewMedia?: boolean | Array<'image' | 'video' | 'audio'>;
  contentMedia?: boolean | Array<'image' | 'video' | 'audio' | 'attachment' | 'file'>;
  allMediaVariants?: boolean;
  mediaByFilename?: {
    images?: string | null;
    audio?: string | null;
    attachments?: string | null;
  };
  comments?: boolean;
}

export interface ProxyOptions {
  url: string;
  rejectUnauthorizedTLS?: boolean;
}

export interface EmbedDownloader {
  provider: string;
  exec: string;
}

export interface DownloaderOptions {
  cookie?: string;
  useStatusCache?: boolean;
  stopOn?: StopOnCondition;
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
    proxy?: ProxyOptions | null;
  };
  fileExistsAction?: {
    content?: FileExistsAction;
    info?: FileExistsAction;
    infoAPI?: FileExistsAction;
  };
  embedDownloaders?: EmbedDownloader[];
  logger?: Logger | null;
  dryRun?: boolean;
}

export type DownloaderInit = DeepRequired<Pick<DownloaderOptions,
  'outDir' |
  'useStatusCache' |
  'stopOn' |
  'pathToFFmpeg' |
  'pathToYouTubeCredentials' |
  'dirNameFormat' |
  'filenameFormat' |
  'include' |
  'request' |
  'fileExistsAction' |
  'embedDownloaders' |
  'dryRun'>>;

const DEFAULT_DOWNLOADER_INIT: DeepRequired<DownloaderInit> = {
  outDir: process.cwd(),
  useStatusCache: true,
  stopOn: 'never',
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
    postsPublished: {
      after: null,
      before: null
    },
    campaignInfo: true,
    contentInfo: true,
    previewMedia: true,
    contentMedia: true,
    allMediaVariants: false,
    mediaByFilename: {
      images: null,
      audio: null,
      attachments: null
    },
    comments: false
  },
  request: {
    maxRetries: 3,
    maxConcurrent: 10,
    minTime: 333,
    proxy: {
      url: '',
      rejectUnauthorizedTLS: true
    },
  },
  fileExistsAction: {
    content: 'skip',
    info: 'saveAsCopyIfNewer',
    infoAPI: 'overwrite'
  },
  embedDownloaders: [],
  dryRun: false
};

export function getDownloaderInit(options?: DownloaderOptions): DownloaderInit {
  const defaults = DEFAULT_DOWNLOADER_INIT;

  let proxy: DownloaderInit['request']['proxy'] = null;
  if (options?.request?.proxy && defaults.request.proxy) {
    proxy = {
      url: options.request.proxy.url,
      rejectUnauthorizedTLS: pickDefined(options.request.proxy.rejectUnauthorizedTLS, defaults.request.proxy.rejectUnauthorizedTLS)
    };
  }
  if (!proxy?.url) {
    proxy = null;
  }

  return {
    outDir: options?.outDir ? path.resolve(options.outDir) : defaults.outDir,
    useStatusCache: pickDefined(options?.useStatusCache, defaults.useStatusCache),
    stopOn: pickDefined(options?.stopOn, defaults.stopOn),
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
      postsPublished: {
        after: pickDefined(options?.include?.postsPublished?.after, defaults.include.postsPublished.after),
        before: pickDefined(options?.include?.postsPublished?.before, defaults.include.postsPublished.before)
      },
      campaignInfo: pickDefined(options?.include?.campaignInfo, defaults.include.campaignInfo),
      contentInfo: pickDefined(options?.include?.contentInfo, defaults.include.contentInfo),
      previewMedia: pickDefined(options?.include?.previewMedia, defaults.include.previewMedia),
      contentMedia: pickDefined(options?.include?.contentMedia, defaults.include.contentMedia),
      allMediaVariants: pickDefined(options?.include?.allMediaVariants, defaults.include.allMediaVariants),
      mediaByFilename: {
        images: pickDefined(options?.include?.mediaByFilename?.images, defaults.include.mediaByFilename.images),
        audio: pickDefined(options?.include?.mediaByFilename?.audio, defaults.include.mediaByFilename.audio),
        attachments: pickDefined(options?.include?.mediaByFilename?.attachments, defaults.include.mediaByFilename.attachments)
      },
      comments: pickDefined(options?.include?.comments, defaults.include.comments)
    },
    request: {
      maxRetries: pickDefined(options?.request?.maxRetries, defaults.request.maxRetries),
      maxConcurrent: pickDefined(options?.request?.maxConcurrent, defaults.request.maxConcurrent),
      minTime: pickDefined(options?.request?.minTime, defaults.request.minTime),
      proxy
    },
    fileExistsAction: {
      content: options?.fileExistsAction?.content || defaults.fileExistsAction.content,
      info: options?.fileExistsAction?.info || defaults.fileExistsAction.info,
      infoAPI: options?.fileExistsAction?.infoAPI || defaults.fileExistsAction.infoAPI
    },
    embedDownloaders: pickDefined(options?.embedDownloaders, defaults.embedDownloaders),
    dryRun: pickDefined(options?.dryRun, defaults.dryRun)
  };
}

export function getDefaultDownloaderOutDir() {
  return DEFAULT_DOWNLOADER_INIT.outDir;
}

export function getDefaultDownloaderOptions(): DeepRequired<DownloaderOptions> {
  return {
    ...getDownloaderInit(),
    cookie: '',
    logger: null
  };
}