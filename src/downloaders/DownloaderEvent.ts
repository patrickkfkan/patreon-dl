import { Campaign } from '../entities/Campaign.js';
import { Post } from '../entities/Post.js';
import { Product } from '../entities/Product.js';
import { IDownloadTaskBatch } from './task/DownloadTaskBatch.js';

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
  AlreadyDownloaded = 1
}

export interface DownloaderEventPayload {

  'fetchBegin': {
    targetType: 'product' | 'post' | 'posts';
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
  } | {
    aborted: false;
    error?: any;
  };
}

export type DownloaderEventPayloadOf<T extends DownloaderEvent> = DownloaderEventPayload[T];
