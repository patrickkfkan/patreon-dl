import { type DownloadProgress, type DownloadTaskError, type IDownloadTask, type DownloadTaskSkipReason } from './DownloadTask.js';

export type DownloadTaskBatchEvent =
  'taskStart' |
  'taskProgress' |
  'taskComplete' |
  'taskError' |
  'taskAbort' |
  'taskSkip' |
  'taskSpawn' |
  'complete';

export interface DownloadTaskBatchEventPayload {

  'taskStart': {
    task: IDownloadTask;
  };

  'taskProgress': {
    task: IDownloadTask;
    progress: DownloadProgress | null;
  };

  'taskComplete': {
    task: IDownloadTask;
  };

  'taskError': {
    error: DownloadTaskError;
    willRetry: boolean;
  };

  'taskAbort': {
    task: IDownloadTask;
  };

  'taskSkip': {
    task: IDownloadTask;
    reason: DownloadTaskSkipReason;
  };

  'taskSpawn': {
    origin: IDownloadTask;
    spawn: IDownloadTask;
  };

  'complete': {};
}

export type DownloadTaskBatchEventPayloadOf<T extends DownloadTaskBatchEvent> = DownloadTaskBatchEventPayload[T];
