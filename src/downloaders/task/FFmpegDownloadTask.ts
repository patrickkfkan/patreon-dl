import fs from 'fs';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import DownloadTask, { DownloadProgress, DownloadTaskParams } from './DownloadTask.js';
import { VideoMediaItem } from '../../entities/MediaItem.js';
import { FileExistsAction } from './../DownloaderOptions.js';
import FSHelper from '../../utils/FSHelper.js';

export interface FFmpegDownloadTaskParams extends DownloadTaskParams<VideoMediaItem> {
  srcEntity: VideoMediaItem;
  destFilePath: string;
  fileExistsAction: FileExistsAction;
}

// https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
export interface FFmpegProgress {
  frames: number; // Total processed frame count
  currentFps: number; // Framerate at which FFmpeg is currently processing
  currentKbps: number; // Throughput at which FFmpeg is currently processing
  targetSize: number; // Current size of the target file in kilobytes
  timemark: string; // The timestamp of the current frame e.g '00:02:23.08'
  percent: number;
}

export default class FFmpegDownloadTask extends DownloadTask<VideoMediaItem> {

  protected name = 'FFmpegDownloadTask';

  #destFilePath: string;
  #fileExistsAction: FileExistsAction;
  #ffmpegCommand: FfmpegCommand | null;
  #commandLine: string | null;

  #abortController: AbortController | null;
  #abortingCallback: (() => void) | null;

  constructor(params: FFmpegDownloadTaskParams) {
    super(params);
    this.#destFilePath = params.destFilePath;
    this.#fileExistsAction = params.fileExistsAction;
    this.#commandLine = null;

    this.#abortController = null;
    this.#abortingCallback = null;
  }

  protected doStart() {
    return new Promise<void>((resolve) => {

      if (this.status === 'aborted') {
        resolve();
      }

      this.#abortController = new AbortController();

      this.resolvedDestPath = this.#destFilePath;

      let lastDownloadedFilePath: string | null = null;
      if (this.#fileExistsAction === 'saveAsCopy' || this.#fileExistsAction === 'saveAsCopyIfNewer') {
        const { filePath, preceding } = FSHelper.checkFileExistsAndIncrement(this.#destFilePath);
        this.resolvedDestPath = filePath;
        lastDownloadedFilePath = preceding;
      }
      else if (this.#fileExistsAction === 'skip' && fs.existsSync(this.#destFilePath)) {
        this.notifySkip({
          name: 'destFileExists',
          message: `Destination file exists (${this.#destFilePath})`,
          existingDestFilePath: this.#destFilePath
        });
        resolve();
        return;
      }

      const destPath = this.resolvedDestPath;
      const tmpFilePath = `${destPath}.part`;
      const __cleanup = () => {
        if (fs.existsSync(tmpFilePath)) {
          this.log('debug', `Clean up ${tmpFilePath}`);
          fs.unlinkSync(tmpFilePath);
        }
      };

      try {
        let hasError = false;
        this.#ffmpegCommand = ffmpeg(this.src)
          .inputOption('-protocol_whitelist file,http,https,tcp,tls')
          .outputOption('-c copy')
          .outputOption('-f mp4')
          .output(tmpFilePath);

        this.#ffmpegCommand.on('start', (commandLine: string) => {
          this.#commandLine = commandLine;
          this.notifyStart();
        });

        this.#ffmpegCommand.on('progress', (progress: FFmpegProgress) => {
          this.notifyProgress(this.#convertFFmpegProgress(progress));
        });

        this.#ffmpegCommand.on('end', async () => {
          if (!hasError) {
            let proceedWithCommit = true;
            if (this.#fileExistsAction === 'saveAsCopyIfNewer' && lastDownloadedFilePath && fs.existsSync(lastDownloadedFilePath)) {
              // Compare checksum of downloaded file with that of last downloaded
              const compareMsg = `(saveAsCopyIfNewer) Compare "${tmpFilePath}" with "${lastDownloadedFilePath}"`;
              proceedWithCommit = !(await FSHelper.compareFiles(tmpFilePath, lastDownloadedFilePath));
              if (!proceedWithCommit) {
                this.log('debug', `${compareMsg}: Files match`);
                this.notifySkip({
                  name: 'destFileExists',
                  message: `Destination file exists with same content (${lastDownloadedFilePath})`,
                  existingDestFilePath: lastDownloadedFilePath
                });
              }
              else {
                this.log('debug', `${compareMsg}: Files do not match`);
              }
            }
            if (proceedWithCommit) {
              this.log('debug', `Commit "${tmpFilePath}" to "${destPath}; filesize: ${fs.lstatSync(tmpFilePath).size} bytes`);
              fs.renameSync(tmpFilePath, destPath);
              this.notifyComplete();
            }
            __cleanup();
            resolve();
          }
        });

        this.#ffmpegCommand.on('error', (error: any) => {
          if (this.#abortingCallback) {
            this.#abortingCallback();
          }
          else {
            hasError = true;
            this.notifyError(error);
          }
          __cleanup();
          resolve();
        });

        this.#abortController.signal.onabort = () => {
          if (this.#ffmpegCommand) {
            this.#ffmpegCommand.kill('SIGKILL');
          }
          else if (this.#abortingCallback) {
            this.#abortingCallback();
            __cleanup();
            resolve();
          }
        };

        this.#ffmpegCommand.run();
      }
      catch (error: any) {
        this.notifyError(error);
        __cleanup();
        resolve();
      }
    })
      .finally(() => {
        if (this.#ffmpegCommand) {
          this.#ffmpegCommand.removeAllListeners();
          this.#ffmpegCommand = null;
        }
        this.#abortController = null;
      });
  }

  protected async doAbort() {
    return new Promise<void>((resolve) => {
      if (this.#abortController) {
        this.#abortingCallback = () => {
          this.#abortingCallback = null;
          this.notifyAbort();
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
    this.#destFilePath = '';
    this.#commandLine = null;
  }

  protected doGetProgress() {
    return undefined;
  }

  get commandLine() {
    return this.#commandLine;
  }

  #convertFFmpegProgress(progress: FFmpegProgress): DownloadProgress | null {
    const video = this.srcEntity;
    if (video.duration && this.resolvedDestFilename && this.resolvedDestPath) {
      const length = video.duration;
      const downloaded = this.#timemarkToSeconds(progress.timemark);
      return {
        destFilename: this.resolvedDestFilename,
        destFilePath: this.resolvedDestPath,
        lengthUnit: 'second',
        length: Number(length.toFixed(2)),
        lengthDownloaded: Number(downloaded.toFixed(2)),
        percent: Number((downloaded / length * 100).toFixed(2)),
        sizeDownloaded: Number(progress.targetSize.toFixed(2)),
        speed: Number(progress.currentKbps.toFixed(2))
      };
    }
    return null;
  }

  /**
   * https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/blob/master/lib/utils.js
   *
   * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
   *
   * @param {String} timemark timemark string
   * @return Number
   */
  #timemarkToSeconds(timemark: string) {
    if (typeof timemark === 'number') {
      return timemark;
    }

    if (timemark.indexOf(':') === -1 && timemark.indexOf('.') >= 0) {
      return Number(timemark);
    }

    const parts = timemark.split(':');

    // Add seconds
    let secs = Number(parts.pop());

    if (parts.length) {
      // Add minutes
      secs += Number(parts.pop()) * 60;
    }

    if (parts.length) {
      // Add hours
      secs += Number(parts.pop()) * 3600;
    }

    return secs;
  }
}
