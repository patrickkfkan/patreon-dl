import { type Campaign } from '../entities/Campaign.js';
import { type Post } from '../entities/Post.js';
import { type Product } from '../entities/Product.js';
import { type IDownloadTaskBatch } from './task/DownloadTaskBatch.js';

export type DownloaderEvent =
  'fetchBegin' |
  'targetBegin' |
  'targetEnd' |
  'phaseBegin' |
  'phaseEnd' |
  'end'
  ;

export enum TargetSkipReason {
  Inaccessible = 0,
  AlreadyDownloaded = 1,
  UnmetMediaTypeCriteria = 2,
  NotInTier = 3,
  PublishDateOutOfRange = 4
}

export interface DownloaderEventPayload {

  'fetchBegin': {
    targetType: 'product' | 'products' | 'post' | 'posts';
  }

  'targetBegin': {
    target: Campaign | Product | Post;
  };

  'targetEnd': {
    target: Campaign | Product | Post;
  } & ({
    isSkipped: false;
  } | {
    isSkipped: true;
    skipReason: TargetSkipReason;
    skipMessage: string;
  });

  'phaseBegin': {
    target: Campaign | Product | Post;
  } & ({
    phase: 'saveInfo' | 'saveMedia';
  } | {
    phase: 'batchDownload';
    batch: IDownloadTaskBatch;
  });

  'phaseEnd': {
    target: Campaign | Product | Post;
    phase: 'saveInfo' | 'saveMedia' | 'batchDownload';
  };

  'end': {
    aborted: true;
    error?: undefined;
    message: string;
  } | {
    aborted: false;
    error?: any;
    message: string;
  };
}

export type DownloaderEventPayloadOf<T extends DownloaderEvent> = DownloaderEventPayload[T];
