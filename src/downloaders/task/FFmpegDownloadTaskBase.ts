import fs from 'fs';
import ffmpeg, { type FfmpegCommand } from 'fluent-ffmpeg';
import { sync as spawnSync } from '@patrickkfkan/cross-spawn';
import DownloadTask, { type DownloadProgress, type DownloadTaskParams } from './DownloadTask.js';
import { type FileExistsAction } from './../DownloaderOptions.js';
import { type Downloadable } from '../../entities/Downloadable.js';
import FSHelper from '../../utils/FSHelper.js';
import { createProxyAgent } from '../../utils/Proxy.js';

export interface FFmpegDownloadTaskBaseParams<T extends Downloadable> extends DownloadTaskParams<T> {
  fileExistsAction: FileExistsAction;
}

export interface FFmpegCommandParams {
  inputs: {
    input: string;
    options?: string[];
  }[];
  output: string;
  outputOptions?: string[];
  noProxy?: boolean;
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

export default abstract class FFmpegDownloadTaskBase<T extends Downloadable> extends DownloadTask<T> {

  abstract name: string;

  static #ffmpegVersion: string | null = null;

  #fileExistsAction: FileExistsAction;
  #ffmpegCommand: FfmpegCommand | null;
  #commandLine: string | null;

  #abortController: AbortController | null;
  #abortingCallback: (() => void) | null;

  constructor(params: FFmpegDownloadTaskBaseParams<T>) {
    super(params);

    this.#fileExistsAction = params.fileExistsAction;
    this.#commandLine = null;

    this.#abortController = null;
    this.#abortingCallback = null;
  }

  protected abstract getFFmpegCommandParams(signal?: AbortSignal): Promise<FFmpegCommandParams>;
  protected abstract getTargetDuration(): number | null;

  protected doStart() {
    return new Promise<void>((resolve) => {
      void (async () => {
        if (this.status === 'aborted') {
          resolve();
          return;
        }
  
        let tmpFilePath: string | null = null;
        const __cleanup = () => {
          if (tmpFilePath && (this.dryRun || fs.existsSync(tmpFilePath))) {
            this.log('debug', `Clean up ${tmpFilePath}`);
            this.fsHelper.unlink(tmpFilePath);
          }
        };
  
        try {
          this.#abortController = new AbortController();
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
  
          let ffmpegCommandParams;
          try {
            ffmpegCommandParams = await this.getFFmpegCommandParams(this.#abortController.signal);
          }
          catch (error) {
            if (this.#abortController.signal.aborted) {
              return;
            }
            throw error;
          }
  
          const destFilePath = ffmpegCommandParams.output;
          this.resolvedDestPath = destFilePath;
  
          let lastDownloadedFilePath: string | null = null;
          if (this.#fileExistsAction === 'saveAsCopy' || this.#fileExistsAction === 'saveAsCopyIfNewer') {
            const { filePath, preceding } = this.fsHelper.checkFileExistsAndIncrement(destFilePath);
            this.resolvedDestPath = filePath;
            lastDownloadedFilePath = preceding;
          }
          else if (this.#fileExistsAction === 'skip' && fs.existsSync(destFilePath)) {
            await this.setDownloaded(destFilePath);
            this.notifySkip({
              name: 'destFileExists',
              message: `Destination file exists (${destFilePath})`,
              existingDestFilePath: destFilePath
            });
            resolve();
            return;
          }
  
          const _destFilePath = this.resolvedDestPath;
          const _tmpFilePath = tmpFilePath = FSHelper.createTmpFilePath(_destFilePath, this.srcEntity.id);
  
          let hasError = false;
  
          this.#ffmpegCommand = this.#constructFFmpegCommand(_tmpFilePath, ffmpegCommandParams);

          this.#ffmpegCommand.on('start', (commandLine: string) => {
            this.#commandLine = commandLine;
            this.notifyStart();
          });
  
          this.#ffmpegCommand.on('progress', (progress: FFmpegProgress) => {
            this.notifyProgress(this.#convertFFmpegProgress(progress));
          });
  
          this.#ffmpegCommand.on('end', () => {
            void (async () => {
              if (!hasError) {
                let proceedWithCommit = true;
                if (this.#fileExistsAction === 'saveAsCopyIfNewer' && lastDownloadedFilePath && fs.existsSync(lastDownloadedFilePath)) {
                  // Compare checksum of downloaded file with that of last downloaded
                  const compareMsg = `(saveAsCopyIfNewer) Compare "${_tmpFilePath}" with "${lastDownloadedFilePath}"`;
                  proceedWithCommit = !(await this.fsHelper.compareFiles(_tmpFilePath, lastDownloadedFilePath));
                  if (!proceedWithCommit) {
                    this.log('debug', `${compareMsg}: Files match`);
                    await this.setDownloaded(lastDownloadedFilePath);
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
                  const filesizeStr = !this.dryRun ? `; filesize: ${fs.lstatSync(_tmpFilePath).size} bytes` : '';
                  this.log('debug', `Commit "${_tmpFilePath}" to "${_destFilePath}${filesizeStr}`);
                  this.fsHelper.rename(_tmpFilePath, _destFilePath);
                  await this.setDownloaded(_destFilePath);
                  this.notifyComplete();
                }
                __cleanup();
                resolve();
              }
            })();
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
  
          this.#ffmpegCommand.run();
        }
        catch (error: any) {
          this.notifyError(error);
          __cleanup();
          resolve();
        }
      })();
    })
    .finally(() => {
      if (this.#ffmpegCommand) {
        this.#ffmpegCommand.removeAllListeners();
        this.#ffmpegCommand = null;
      }
      this.#abortController = null;
    });
  }

  #constructFFmpegCommand(tmpFilePath: string, params: FFmpegCommandParams) {
    const __hasFFmpegOption = (options: string[] | undefined, key: string) => {
      if (!options) {
        return false;
      }
      return options.some((s) => s.trim().startsWith(`${key} `));
    };

    const { inputs, outputOptions, noProxy = false } = params;

    if (inputs.length === 0) {
      throw Error('Unable to create FFmpeg command: no input specified');
    }

    const command = ffmpeg();

    let proxyURL = '';
    const proxyAgentInfo = !noProxy ? createProxyAgent(this.config) : null;
    if (proxyAgentInfo) {
      // FFmpeg only supports HTTP proxy
      if (proxyAgentInfo.protocol === 'http') {
        proxyURL = proxyAgentInfo.proxyURL;
      }
      else {
        this.log('warn', `${proxyAgentInfo.protocol.toUpperCase()} proxy ignored - FFmpeg supports HTTP proxy only`)
      }
    }

    command.input(inputs[0].input);
    inputs.forEach(({input, options}, index) => {
      if (index > 0) {
        command.input(input);
      }
      const _options = options ? [...options] : [];
      if (proxyURL) {
        const whitelistIndex = _options.findIndex((opt) => opt.startsWith('-protocol_whitelist')) + 1;
        if (whitelistIndex > 0 && _options[whitelistIndex]) {
          const whitelistEntries = _options[whitelistIndex].trim().split(',').map((entry) => entry.trim());
          if (!whitelistEntries.includes('httpproxy')) {
            _options[whitelistIndex] += ',httpproxy';
          }
        }
        else {
          _options.push('-protocol_whitelist', 'http,https,tcp,tls,httpproxy');
        }
        _options.push('-http_proxy', proxyURL);
      }
      if (_options.length > 0) {
        command.inputOptions(..._options)
      }
    });

    if (!__hasFFmpegOption(outputOptions, '-c')) {
      command.outputOption('-c copy');
    }
    if (!__hasFFmpegOption(outputOptions, '-f')) {
      command.outputOption('-f mp4');
    }
    outputOptions?.forEach((opt) => command.outputOption(opt));

    if (this.dryRun) {
      const output = process.platform === 'win32' ? 'NUL' : '/dev/null';
      this.log('debug', `(dry-run) FFmpeg output to "${output}"`);
      command.output(output);
    }
    else {
      command.output(tmpFilePath);
    }

    this.log('debug', 'FFmpeg command args:', command._getArguments());

    return command;
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
    this.#commandLine = null;
    return Promise.resolve();
  }

  protected doGetProgress() {
    return undefined;
  }

  get commandLine() {
    return this.#commandLine;
  }

  #convertFFmpegProgress(progress: FFmpegProgress): DownloadProgress | null {
    if (this.resolvedDestFilename && this.resolvedDestPath) {
      const targetDuration = this.getTargetDuration();
      const downloaded = this.#timemarkToSeconds(progress.timemark);
      return {
        destFilename: this.resolvedDestFilename,
        destFilePath: this.resolvedDestPath,
        lengthUnit: 'second',
        length: targetDuration !== null ? Number(targetDuration.toFixed(2)) : undefined,
        lengthDownloaded: Number(downloaded.toFixed(2)),
        percent: targetDuration !== null ? Number((downloaded / targetDuration * 100).toFixed(2)) : undefined,
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

  protected getFFmpegVersion() {
    if (FFmpegDownloadTaskBase.#ffmpegVersion) {
      return FFmpegDownloadTaskBase.#ffmpegVersion;
    }
    try {
      const args = ['-version'];
      const result = spawnSync(this.config.pathToFFmpeg || 'ffmpeg', args, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (result.error) {
        throw result.error;
      }

      const versionLine = result.stdout.toString('utf8').split('\n')[0];
      const versionMatch = versionLine.match(/ffmpeg version (\S+)/);
      FFmpegDownloadTaskBase.#ffmpegVersion = versionMatch ? versionMatch[1] : null;
      if (!FFmpegDownloadTaskBase.#ffmpegVersion) {
        throw new Error('No match for version string found in ffmpeg output');
      }
      this.log('debug', `FFmpeg version: ${FFmpegDownloadTaskBase.#ffmpegVersion}`);
    } catch (error) {
      if (error instanceof Error) {
        this.log('error', 'Failed to get FFmpeg version:', error);
      } else {
        this.log('error', 'Failed to get FFmpeg version:', String(error));
      }
      this.log('warn', 'FFmpeg command might fail');
      FFmpegDownloadTaskBase.#ffmpegVersion = 'error';
    }

    return FFmpegDownloadTaskBase.#ffmpegVersion;
  }
}
