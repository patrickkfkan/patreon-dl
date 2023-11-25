import path from 'path';
import fs from 'fs';
import Fetcher from '../../utils/Fetcher.js';
import FetcherProgressMonitor, { FetcherProgress } from '../../utils/FetcherProgressMonitor.js';
import FilenameResolver from '../../utils/FllenameResolver.js';
import DownloadTask, { DownloadTaskParams, DownloadProgress, DownloadTaskSkipReason } from './DownloadTask.js';
import M3U8DownloadTask from './M3U8DownloadTask.js';
import { Downloadable } from '../../entities/Downloadable.js';
import { AbortError } from 'node-fetch';
import { FileExistsAction } from '../DownloaderOptions.js';
import FSHelper from '../../utils/FSHelper.js';

export interface FetcherDownloadTaskParams<T extends Downloadable> extends DownloadTaskParams {
  fetcher: Fetcher;
  destDir: string;
  destFilenameResolver: FilenameResolver<T>;
  fileExistsAction: FileExistsAction;
}

export default class FetcherDownloadTask<T extends Downloadable> extends DownloadTask {

  protected name = 'FetcherDownloadTask';

  #fetcher: Fetcher;

  #destDir: string;
  #destFilenameResolver: FilenameResolver<T>;
  #fileExistsAction: FileExistsAction;
  #abortController: AbortController | null;
  #progressMonitor: FetcherProgressMonitor | null;
  #abortingCallback: (() => void) | null;

  constructor(params: FetcherDownloadTaskParams<T>) {
    super(params);
    this.#fetcher = params.fetcher;
    this.#destDir = params.destDir;
    this.#destFilenameResolver = params.destFilenameResolver;
    this.#fileExistsAction = params.fileExistsAction;
    this.#abortController = null;
    this.#progressMonitor = null;
    this.#abortingCallback = null;
  }

  #checkAndSpawnFFmpegDownloadTask(
    currentDestFilePath: string,
    preferredOutputFilePath: string) {

    if (this.srcEntity.type === 'video' && this.#isM3U8FilePath(currentDestFilePath) && this.callbacks) {
      // Spawn FFmpeg task to download actual stream
      const spawn = new M3U8DownloadTask({
        src: currentDestFilePath,
        srcEntity: this.srcEntity,
        maxRetries: this.maxRetries,
        callbacks: this.callbacks,
        logger: this.logger,
        destFilePath: FSHelper.changeFilePathExtension(preferredOutputFilePath, '.mp4'),
        fileExistsAction: this.#fileExistsAction
      });
      this.callbacks.onSpawn(this, spawn);
    }
  }

  #isM3U8FilePath(filePath: string) {
    return path.extname(filePath) === '.m3u8';
  }

  protected doStart() {
    return new Promise<void>(async (resolve) => {

      if (this.status === 'aborted') {
        resolve();
      }

      this.#abortController = new AbortController();

      /**
       * Change status to downloading ahead of notifyStart(), so that task can be
       * aborted even though we have not yet obtained progress monitor from `Fetcher.download()`.
       */
      this.status = 'downloading';
      let skipped = false;
      const fileExistsAction = this.#fileExistsAction;
      try {
        const { destFilePath, monitor, start, abort } = await this.#fetcher.prepareDownload({
          url: this.src,
          destDir: this.#destDir,
          srcEntity: this.srcEntity,
          destFilenameResolver: this.#destFilenameResolver,
          signal: this.#abortController.signal
        });

        this.resolvedDestPath = destFilePath;

        // Skip download?
        let skipDownload: { skip: false; } | { skip: true; reason: DownloadTaskSkipReason } = { skip: false };
        let lastDownloadedFilePath: string | null = null;
        if (fileExistsAction === 'saveAsCopy' || fileExistsAction === 'saveAsCopyIfNewer') {
          const inc = FSHelper.checkFileExistsAndIncrement(destFilePath);
          this.resolvedDestPath = inc.filePath;
          lastDownloadedFilePath = inc.preceding;
        }
        else if (fileExistsAction === 'skip' && fs.existsSync(destFilePath)) {
          const isM3U8 = this.srcEntity.type === 'video' && this.#isM3U8FilePath(destFilePath);
          const mp4FilePath = FSHelper.changeFilePathExtension(destFilePath, '.mp4');
          if (isM3U8 && !fs.existsSync(mp4FilePath)) {
            this.log('debug', `Ignoring 'fileExistsAction: skip' for URL "${this.src}": target download is M3U8 playlist and its ` +
              `associated media file "${mp4FilePath}" does not exist`);
          }
          else {
            skipDownload = {
              skip: true,
              reason: {
                name: 'destFileExists',
                message: `Destination file exists (${destFilePath})`,
                existingDestFilePath: destFilePath
              }
            };
          }
        }

        const __handleSkip = (skipAction: () => void) => {
          if (skipDownload.skip) {
            skipped = true;
            skipAction();
            const reason = skipDownload.reason;
            this.notifySkip(reason);
            resolve();
            return true;
          }
          return false;
        };

        if (__handleSkip(abort)) {
          return;
        }

        monitor.on('progress', (progress) => {
          this.notifyProgress(this.#convertFetcherProgress(progress));
        });

        this.#progressMonitor = monitor;

        this.notifyStart();

        const { tmpFilePath, commit, discard } = await start({ destFilePath: this.resolvedDestPath });

        let proceedWithCommit = true;
        if (fileExistsAction === 'saveAsCopyIfNewer' && lastDownloadedFilePath && fs.existsSync(lastDownloadedFilePath)) {
          // Compare checksum of downloaded file with that of last download
          const compareMsg = `(saveAsCopyIfNewer) Compare "${tmpFilePath}" with "${lastDownloadedFilePath}"`;
          proceedWithCommit = !(await FSHelper.compareFiles(tmpFilePath, lastDownloadedFilePath));
          if (!proceedWithCommit) {
            this.log('debug', `${compareMsg}: Files match`);
            skipDownload = {
              skip: true,
              reason: {
                name: 'destFileExists',
                message: `Destination file exists with same content (${lastDownloadedFilePath})`,
                existingDestFilePath: lastDownloadedFilePath
              }
            };
            this.resolvedDestPath = lastDownloadedFilePath;
            __handleSkip(discard);
          }
          else {
            this.log('debug', `${compareMsg}: Files do not match`);
          }
        }

        if (proceedWithCommit) {
          commit();
        }

        this.#checkAndSpawnFFmpegDownloadTask(this.resolvedDestPath, destFilePath);

        if (proceedWithCommit) {
          this.notifyComplete();
          resolve();
        }
      }
      catch (error: any) {
        if (error instanceof AbortError) {
          if (!skipped) {
            this.notifyAbort();
            if (this.#abortingCallback) {
              this.#abortingCallback();
            }
          }
        }
        else {
          this.notifyError(error);
        }
        resolve();
      }
    })
      .finally(() => {
        if (this.#progressMonitor) {
          this.#progressMonitor.removeAllListeners();
          this.#progressMonitor = null;
        }
        this.#abortController = null;
      });
  }

  protected async doAbort() {
    return new Promise<void>((resolve) => {
      if (this.#abortController) {
        this.#abortingCallback = () => {
          this.#abortingCallback = null;
          resolve();
        };
        this.#abortController.abort();
      }
      else {
        resolve();
      }
    });
  }

  protected async doDestroy() {
    this.#destDir = '';
  }

  protected doGetProgress() {
    if (this.#progressMonitor) {
      return this.#convertFetcherProgress(this.#progressMonitor.getProgress());
    }
    return undefined;
  }

  #convertFetcherProgress(progress: FetcherProgress): DownloadProgress {
    return {
      destFilename: progress.destFilename,
      destFilePath: progress.destFilePath,
      lengthUnit: 'byte',
      length: progress.length,
      lengthDownloaded: progress.transferred,
      percent: progress.percentage,
      sizeDownloaded: Number((progress.transferred / 1000).toFixed(2)),
      speed: Number((progress.speed / 1000).toFixed(2))
    };
  }
}
