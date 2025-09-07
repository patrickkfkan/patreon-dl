import path from 'path';
import fs from 'fs';
import { minimatch } from 'minimatch';
import type Fetcher from '../../utils/Fetcher.js';
import {type FetcherProgress} from '../../utils/FetcherProgressMonitor.js';
import type FetcherProgressMonitor from '../../utils/FetcherProgressMonitor.js';
import type FilenameResolver from '../../utils/FllenameResolver.js';
import DownloadTask, { type DownloadTaskParams, type DownloadProgress, type DownloadTaskSkipReason } from './DownloadTask.js';
import M3U8DownloadTask from './M3U8DownloadTask.js';
import { type Downloadable } from '../../entities/Downloadable.js';
import { type FileExistsAction } from '../DownloaderOptions.js';

export interface FetcherDownloadTaskParams<T extends Downloadable> extends DownloadTaskParams {
  fetcher: Fetcher;
  destDir: string;
  destFilenameResolver: FilenameResolver<T>;
  fileExistsAction: FileExistsAction;
  isAttachment?: boolean;
}

export default class FetcherDownloadTask<T extends Downloadable> extends DownloadTask {

  protected name = 'FetcherDownloadTask';

  #fetcher: Fetcher;

  #destDir: string;
  #destFilenameResolver: FilenameResolver<T>;
  #fileExistsAction: FileExistsAction;
  #isAttachment: boolean;
  #abortController: AbortController | null;
  #progressMonitor: FetcherProgressMonitor | null;
  #abortingCallback: (() => void) | null;

  constructor(params: FetcherDownloadTaskParams<T>) {
    super(params);
    this.#fetcher = params.fetcher;
    this.#destDir = params.destDir;
    this.#destFilenameResolver = params.destFilenameResolver;
    this.#fileExistsAction = params.fileExistsAction;
    this.#isAttachment = params.isAttachment ?? false;
    this.#abortController = null;
    this.#progressMonitor = null;
    this.#abortingCallback = null;
  }

  async #checkAndSpawnFFmpegDownloadTask(
    currentDestFilePath: string,
    preferredOutputFilePath: string) {

    if (this.srcEntity.type === 'video' && this.#isM3U8FilePath(currentDestFilePath) && this.callbacks) {
      // Spawn FFmpeg task to download actual stream
      const spawn = await DownloadTask.create(M3U8DownloadTask, {
        downloadType: 'main',
        config: this.config,
        src: this.src,
        srcEntity: this.srcEntity,
        callbacks: this.callbacks,
        logger: this.logger,
        destFilePath: this.fsHelper.changeFilePathExtension(preferredOutputFilePath, '.mp4'),
        fileExistsAction: this.#fileExistsAction
      });
      this.callbacks.onSpawn(this, spawn);
      return true;
    }
    return false;
  }

  #isM3U8FilePath(filePath: string) {
    return path.extname(filePath) === '.m3u8';
  }

  protected async resolveDestPath(signal?: AbortSignal) {
    return await this.#fetcher.resolveDestFilePath({
      url: this.src,
      destDir: this.#destDir,
      destFilenameResolver: this.#destFilenameResolver,
      setReferer: this.srcEntity.type === 'video',
      signal
    });
  }

  protected doStart() {
    return new Promise<void>((resolve) => {
      void (async () => {
        if (!this.resolvedDestPath) {
          this.notifyError(Error('Destination file path not resolved'));
          resolve();
          return;
        }
        if (this.status === 'aborted') {
          resolve();
          return;
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
          const destFilePath = this.resolvedDestPath;
          const { monitor, start, abort } = await this.#fetcher.prepareDownload({
            url: this.src,
            srcEntity: this.srcEntity,
            destFilePath,
            setReferer: this.srcEntity.type === 'video',
            signal: this.#abortController.signal
          });
  
          // Skip download?
          let skipDownload: { skip: false; } | { skip: true; reason: DownloadTaskSkipReason } = { skip: false };
          let lastDownloadedFilePath: string | null = null;
          const includeByFilename = this.#checkIncludeMediaByFilenameOption();
          if (!includeByFilename.ok) {
            skipDownload = {
              skip: true,
              reason: includeByFilename.reason
            };
          }
          else if (fileExistsAction === 'saveAsCopy' || fileExistsAction === 'saveAsCopyIfNewer') {
            const inc = this.fsHelper.checkFileExistsAndIncrement(destFilePath);
            this.resolvedDestPath = inc.filePath;
            lastDownloadedFilePath = inc.preceding;
          }
          else if (fileExistsAction === 'skip' && fs.existsSync(destFilePath)) {
            const isM3U8 = this.srcEntity.type === 'video' && this.#isM3U8FilePath(destFilePath);
            const mp4FilePath = this.fsHelper.changeFilePathExtension(destFilePath, '.mp4');
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
  
          const __handleSkip = async (skipAction: () => void) => {
            if (skipDownload.skip) {
              skipped = true;
              skipAction();
              const reason = skipDownload.reason;
              if (reason.name === 'destFileExists') {
                await this.setDownloaded(reason.existingDestFilePath);
              }
              this.notifySkip(reason);
              resolve();
              return true;
            }
            return false;
          };
  
          if (await __handleSkip(abort)) {
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
            proceedWithCommit = !(await this.fsHelper.compareFiles(tmpFilePath, lastDownloadedFilePath));
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
              await __handleSkip(discard);
            }
            else {
              this.log('debug', `${compareMsg}: Files do not match`);
            }
          }
  
          if (proceedWithCommit) {
            commit();
          }
  
          const spawned = await this.#checkAndSpawnFFmpegDownloadTask(this.resolvedDestPath, destFilePath);
          
          if (!spawned) {
            await this.setDownloaded(this.resolvedDestPath);
          }

          if (proceedWithCommit) {
            this.notifyComplete();
            resolve();
          }
        }
        catch (error: any) {
          if (this.#abortController.signal.aborted) {
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
      })();
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
    return Promise.resolve();
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

  #checkIncludeMediaByFilenameOption(): { ok: true; } | { ok: false; reason: DownloadTaskSkipReason; } {
    const itemType = this.srcEntity.type;
    let prop: keyof typeof this.config.include.mediaByFilename | null;
    if (this.#isAttachment) {
      prop = 'attachments';
    }
    else {
      switch (itemType) {
        case 'image':
          prop = 'images';
          break;
        case 'audio':
          prop = 'audio';
          break;
        case 'attachment':
          prop = 'attachments';
          break;
        default:
          prop = null;
      }
    }
    let pattern = prop ? this.config.include.mediaByFilename[prop] : null;
    let nocase = false;
    if (pattern && pattern.startsWith('!')) {
      pattern = pattern.substring(1);
      nocase = true;
    }
    const dest = this.resolvedDestFilename;
    if (prop && pattern) {
      const confName = `include.mediaByFilename.${prop}`;
      if (!dest) {
        this.log('warn', `Skipped config '${confName}': destination filename unavailable`);
        return { ok: true };
      }
      const patternMatched = minimatch(dest, pattern, { nocase });
      const matchString = patternMatched ? 'OK' : 'failed';
      this.log('debug', `Config '${confName}': test "${pattern}" <-> "${dest}" ${matchString} (${nocase ? 'case-insensitive' : 'case-sensitive'})`);
      if (patternMatched) {
        return { ok: true };
      }
      return {
        ok: false,
        reason: {
          name: 'includeMediaByFilenameUnfulfilled',
          itemType,
          pattern,
          destFilename: dest,
          message: `Media filename does not match pattern provided in config->${confName}`
        } as DownloadTaskSkipReason
      };
    }
    return { ok: true };
  }
}
