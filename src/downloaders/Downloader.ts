import fs from 'fs';
import { EventEmitter } from 'events';
import deepFreeze from 'deep-freeze';
import Fetcher from '../utils/Fetcher.js';
import Bootstrap, { type DownloaderBootstrapData, type DownloaderType } from './Bootstrap.js';
import { type DownloaderInit, type DownloaderOptions, type FileExistsAction, getDownloaderInit } from './DownloaderOptions.js';
import { type DownloaderEvent, type DownloaderEventPayloadOf } from './DownloaderEvent.js';
import {type LogLevel} from '../utils/logging/Logger.js';
import type Logger from '../utils/logging/Logger.js';
import { commonLog } from '../utils/logging/Logger.js';
import { type Campaign } from '../entities/Campaign.js';
import FSHelper, { type WriteTextFileResult } from '../utils/FSHelper.js';
import DownloadTaskBatch from './task/DownloadTaskBatch.js';
import DownloadTask, { type IDownloadTask } from './task/DownloadTask.js';
import DownloadTaskFactory from './task/DownloadTaskFactory.js';
import FilenameFormatHelper from '../utils/FilenameFormatHelper.js';
import { type Downloadable } from '../entities/Downloadable.js';
import { generateCampaignSummary } from './templates/CampaignInfo.js';
import path from 'path';
import URLHelper from '../utils/URLHelper.js';
import ffmpeg from 'fluent-ffmpeg';
import InnertubeLoader from '../utils/yt/InnertubeLoader.js';
import FFmpegDownloadTaskBase from './task/FFmpegDownloadTaskBase.js';
import { type UserIdOrVanityParam } from '../entities/User.js';
import ExternalDownloaderTask from './task/ExternalDownloaderTask.js';
import Bottleneck from 'bottleneck';

export type DownloaderConfig<T extends DownloaderType> =
  DownloaderInit &
  Omit<DownloaderBootstrapData<T>, 'type'>;

export interface DownloaderStartParams {
  signal?: AbortSignal;
}

interface CreateDownloadTaskParams {
  target: Downloadable[];
  targetName: string;
  destDir: string;
  fileExistsAction: FileExistsAction;
}

export default abstract class Downloader<T extends DownloaderType> extends EventEmitter {

  abstract name: string;

  protected fetcher: Fetcher;
  protected fsHelper: FSHelper;
  protected config: DownloaderConfig<T>;
  protected logger?: Logger | null;

  #hasEmittedEndEventOnAbort: boolean;

  constructor(bootstrap: DownloaderBootstrapData<T>, options?: DownloaderOptions) {
    super();
    this.#validateOptions(options);

    this.config = {
      ...bootstrap,
      ...getDownloaderInit(options)
    };

    this.fetcher = new Fetcher(this.config, options?.cookie, options?.logger);
    this.fsHelper = new FSHelper(this.config, this.logger);
    this.logger = options?.logger;

    if (this.config.pathToFFmpeg) {
      ffmpeg.setFfmpegPath(this.config.pathToFFmpeg);
    }

    InnertubeLoader.setLogger(this.logger);
    if (this.config.pathToYouTubeCredentials) {
      InnertubeLoader.setCredentialsFile(this.config.pathToYouTubeCredentials);
    }

    this.#hasEmittedEndEventOnAbort = false;
  }

  protected createDownloadTaskBatch(name: string, signal?: AbortSignal, ...createTasks: Array<CreateDownloadTaskParams | null>): Promise<{ batch: DownloadTaskBatch; errorCount: number; }> {

    const __getDownloadIdString = (task: IDownloadTask, batch: DownloadTaskBatch) => {
      let result = `#${batch.id}.${task.id}`;
      if (task.retryCount > 0) {
        result += `-r${task.retryCount}`;
      }
      return result;
    };

    const batch = new DownloadTaskBatch({
      name,
      fetcher: this.fetcher,
      limiter: this.config.request,
      logger: this.logger
    });

    batch.on('taskStart', ({task}) => {
      const retryOrBeginStr = task.retryCount > 0 ? 'retry' : 'begin';
      const isExternal = task instanceof ExternalDownloaderTask;
      const destStr = isExternal ? ' -> Unknown destination (external process)' : task.resolvedDestFilename ? ` -> ${task.resolvedDestFilename}` : '';
      this.log('info', `Download ${retryOrBeginStr} (${__getDownloadIdString(task, batch)}): [type: ${task.srcEntity.type}; ID: #${task.srcEntity.id}]${destStr}`);
      if (task instanceof FFmpegDownloadTaskBase) {
        const retryOrBeginStr = task.retryCount > 0 ? 'Retry' : 'Begin';
        this.log('info', `${retryOrBeginStr} downloading through FFmpeg (${__getDownloadIdString(task, batch)}): ${task.commandLine}`);
      }
    });

    batch.on('taskComplete', ({task}) => {
      const isExternal = task instanceof ExternalDownloaderTask;
      const destStr = isExternal ? ': Unknown destination (external process)' : task.resolvedDestPath ? `: "${task.resolvedDestPath}"` : '';
      this.log('info', `Download complete (${__getDownloadIdString(task, batch)})${destStr}`);
    });

    batch.on('taskError', ({error, willRetry}) => {
      const { task, cause, message } = error;
      const retryStr = willRetry ? '- will retry' : '';
      this.log('error', `Download error (${__getDownloadIdString(task, batch)}):`, cause || message, `(${task.src})`, retryStr);
    });

    batch.on('taskAbort', ({task}) => {
      this.log('warn', `Download aborted (${__getDownloadIdString(task, batch)})`);
    });

    batch.on('taskSkip', ({task, reason}) => {
      this.log('warn', `Download skipped (${__getDownloadIdString(task, batch)}): ${reason.message}`);
    });

    batch.on('taskSpawn', ({origin, spawn}) => {
      this.log('info', `Download spawned: #${batch.id}.${origin.id} -> #${batch.id}.${spawn.id}`);
    });

    /**
     * Uncomment this block to log download progress

    batch.on('taskProgress', ({task, progress}) => {
      if (progress) {
        if (progress.length) {
          this.log('info', `Download progress (${__getDownloadIdString(task, batch)}): ${progress.lengthDownloaded} / ${progress.length} ${progress.lengthUnit}s / ${progress.percent}% (${progress.speed} kB/s)`,);
        }
        else {
          this.log('info', `Download progress (${__getDownloadIdString(task, batch)}): ${progress.lengthDownloaded} / ? ${progress.lengthUnit}s (${progress.speed} kB/s)`,);
        }
      }
      else {
        this.log('warn', `Download progress not available (${__getDownloadIdString(task, batch)})`);
      }
    });

    */

    batch.on('complete', () => {
      const total = batch.getTasks().length;
      const completed = batch.getTasks('completed').length;
      const error = batch.getTasks('error').length;
      const aborted = batch.getTasks('aborted').length;
      const skipped = batch.getTasks('skipped').length;
      const counts = [
        `${total} downloads`,
        `${completed} completed`,
        `${error} errors`,
        `${skipped} skipped`,
        `${aborted} aborted`
      ].join('; ');
      this.log('info', `Download batch complete (#${batch.id}): ${counts}`);
    });

    return this.addToDownloadTaskBatch(batch, signal, ...createTasks);
  }

  protected async addToDownloadTaskBatch(batch: DownloadTaskBatch, signal?: AbortSignal, ...createTasks: Array<CreateDownloadTaskParams | null>) {
    let failedCreateTaskCount = 0;
    for (const task of createTasks) {
      if (!task) {
        continue;
      }
      const { target, targetName, destDir } = task;
      this.log('info', `Create download tasks for ${targetName}`);
      if (task.target.length === 0) {
        this.log('warn', `No items in ${targetName}`);
        continue;
      }
      let createdCount = 0;
      for (const tt of target) {
        try {
          const tasks = await DownloadTaskFactory.createFromDownloadable({
            config: this.config,
            item: tt,
            destDir,
            fetcher: this.fetcher,
            fileExistsAction: task.fileExistsAction,
            limiter: batch.limiter,
            signal,
            logger: this.logger
          });
          // Filter out tasks that are DOA (errors that occurred in DownloadTask.create())
          for (const task of tasks) {
            if (task.doa) {
              this.log('error', `Failed to create download task for item #${tt.id} in ${targetName}:`, task.doa.msg, task.doa.cause);
              failedCreateTaskCount++;
            }
          }
          batch.addTasks(tasks.filter((task) => !task.doa));
          createdCount += tasks.length;
        }
        catch (error) {
          if (signal?.aborted) {
            this.log('warn', 'Operation aborted');
            return { batch, errorCount: failedCreateTaskCount };
          }
          this.log('error', `Failed to create download task(s) for item #${tt.id} in ${targetName}:`, error);
          failedCreateTaskCount++;
        }
      }
      if (createdCount > 0) {
        this.fsHelper.createDir(destDir);
      }
    }
    if (failedCreateTaskCount > 0) {
      this.log('warn', `${failedCreateTaskCount} items could not be processed for downloading`);
    }
    return { batch, errorCount: failedCreateTaskCount };
  }

  abstract start(params: DownloaderStartParams): Promise<void>;

  static async getInstance(url: string, options?: DownloaderOptions) {
    const bootstrap = Bootstrap.getDownloaderBootstrapDataByURL(url);
    if (!bootstrap) {
      throw Error('Could not determine downloader type from URL');
    }
    switch (bootstrap.type) {
      case 'product': {
        const ProductDownloader = (await import('./ProductDownloader.js')).default;
        return new ProductDownloader(bootstrap, options);
      }
      case 'post': {
        const PostDownloader = (await import('./PostDownloader.js')).default;
        return new PostDownloader(bootstrap, options);
      }
    }
  }

  static async getCampaign(
    creator: string | UserIdOrVanityParam,
    signal?: AbortSignal,
    logger?: Logger | null
  ) {
    // Backwards compatibility - if 'creator' is string type, then it is vanity
    const url = URLHelper.constructUserPostsURL(typeof creator === 'object' ? creator : { vanity: creator });
    const downloader = await this.getInstance(url, { logger });
    const PostDownloader = (await import('./PostDownloader.js')).default;
    if (downloader instanceof PostDownloader) {
      return downloader.__getCampaign(signal);
    }
    throw Error('Type mismatch: PostDownloader expected');
  }

  #validateOptions(options?: DownloaderOptions) {
    if (!options) {
      return true;
    }

    // Check FFmpeg path exists
    if (options.pathToFFmpeg) {
      if (!fs.existsSync(options.pathToFFmpeg)) {
        throw Error(`Path to FFmpeg executable "${options.pathToFFmpeg}" does not exist`);
      }
      else if (!fs.lstatSync(options.pathToFFmpeg).isFile()) {
        throw Error(`Path to FFmpeg executable "${options.pathToFFmpeg}" does not point to a file`);
      }
    }

    // Check outDir is a directory
    if (options.outDir) {
      if (fs.existsSync(options.outDir) && !fs.lstatSync(options.outDir).isDirectory()) {
        throw Error(`"${options.outDir}" is not a directory`);
      }
    }

    // Check formats are valid
    const campaignDirNameFormat = options.dirNameFormat?.campaign;
    if (campaignDirNameFormat) {
      const validate = FilenameFormatHelper.validateCampaignDirNameFormat(campaignDirNameFormat);
      if (!validate.validateOK) {
        throw Error(`Campaign directory name format '${campaignDirNameFormat}' is invalid (matched against ${validate.regex})`);
      }
    }
    const contentDirNameFormat = options.dirNameFormat?.content;
    if (contentDirNameFormat) {
      const validate = FilenameFormatHelper.validateContentDirNameFormat(contentDirNameFormat);
      if (!validate.validateOK) {
        throw Error(`Content directory name format '${contentDirNameFormat}' is invalid (matched against ${validate.regex})`);
      }
    }
    const mediaFilenameFormat = options.filenameFormat?.media;
    if (mediaFilenameFormat) {
      const validate = FilenameFormatHelper.validateMediaFilenameFormat(mediaFilenameFormat);
      if (!validate.validateOK) {
        throw Error(`Media filename format '${mediaFilenameFormat}' is invalid (matched against ${validate.regex})`);
      }
    }

    return true;
  }

  protected saveCampaignInfo(campaign: Campaign | null, signal?: AbortSignal) {

    return new Promise<void>((resolve) => {
      void (async () => {
        if (!this.config.include.campaignInfo) {
          resolve();
          return;
        }
  
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
  
        let batch: DownloadTaskBatch | null = null;
        const abortHandler = () => {
          void (async () => {
            if (batch) {
              await batch.abort();
            }
          })();
        };
        if (signal) {
          signal.addEventListener('abort', abortHandler, { once: true });
        }
  
        if (!campaign) {
          this.log('warn', 'Skipped saving campaign info: target unavailable');
          resolve();
          return;
        }
  
        this.log('info', `Save campaign info #${campaign.id}`);
        this.emit('targetBegin', { target: campaign });
        this.emit('phaseBegin', { target: campaign, phase: 'saveInfo' });
  
        // Step 1: create campaign directories
        const campaignDirs = this.fsHelper.getCampaignDirs(campaign);
        this.log('debug', 'Campaign directories: ', campaignDirs);
        this.fsHelper.createDir(campaignDirs.root);
        this.fsHelper.createDir(campaignDirs.info);
  
        // Step 2: save summary and raw json
        const summary = generateCampaignSummary(campaign);
        const summaryFile = path.resolve(campaignDirs.info, 'info.txt');
        const saveSummaryResult = await this.fsHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
        this.logWriteTextFileResult(saveSummaryResult, campaign, 'campaign summary');
  
        // Campaign / creator raw data might not be complete. Fetch directly from API.
        // Strictly speaking, we should check for 'error' in results, but since it's not going to be fatal we'll just skip it.
        const { json: fetchedCampaignAPIData } = await this.fetchCampaign(campaign.id, signal);
        const { json: fetchedCreatorAPIData } = campaign.creator ? await this.fetchUser(campaign.creator.id, signal) : { json: null };
  
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
  
        const campaignRawFile = path.resolve(campaignDirs.info, 'campaign-api.json');
        const saveCampaignRawResult = await this.fsHelper.writeTextFile(
          campaignRawFile, fetchedCampaignAPIData || campaign.raw, this.config.fileExistsAction.infoAPI);
        this.logWriteTextFileResult(saveCampaignRawResult, campaign, 'campaign API data');
  
        if (campaign.creator) {
          const creatorRawFile = path.resolve(campaignDirs.info, 'creator-api.json');
          const saveCreatorRawResult = await this.fsHelper.writeTextFile(
            creatorRawFile, fetchedCreatorAPIData || campaign.creator.raw, this.config.fileExistsAction.infoAPI);
          this.logWriteTextFileResult(saveCreatorRawResult, campaign.creator, 'creator API data');
        }
  
        this.emit('phaseEnd', { target: campaign, phase: 'saveInfo' });
  
        // Step 3: download campaign media items
        this.emit('phaseBegin', { target: campaign, phase: 'saveMedia' });
        const campaignMedia: Downloadable[] = [
          campaign.avatarImage,
          campaign.coverPhoto
        ];
        if (campaign.creator) {
          campaignMedia.push(
            campaign.creator.image,
            campaign.creator.thumbnail
          );
        }
        for (const reward of campaign.rewards) {
          if (reward.image) {
            campaignMedia.push(reward.image);
          }
        }
        batch = (await this.createDownloadTaskBatch(
          `Campaign #${campaign.id} (${campaign.name})`,
          signal,
          {
            target: campaignMedia,
            targetName: `campaign #${campaign.id} -> images`,
            destDir: campaignDirs.info,
            fileExistsAction: this.config.fileExistsAction.info
          }
        )).batch;
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
        batch.prestart();
        this.emit('phaseBegin', { target: campaign, phase: 'batchDownload', batch });
        await batch.start();
        await batch.destroy();
        this.emit('phaseEnd', { target: campaign, phase: 'batchDownload' });
        this.emit('phaseEnd', { target: campaign, phase: 'saveMedia' });
  
        if (signal) {
          signal.removeEventListener('abort', abortHandler);
        }
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
  
        // Done
        this.log('info', 'Done saving campaign info');
        this.emit('targetEnd', { target: campaign, isSkipped: false });
  
        resolve();
      })();
    });

  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.logger, level, this.name, ...msg);
  }

  getConfig() {
    return deepFreeze(this.config);
  }

  protected checkAbortSignal(signal: AbortSignal | undefined, resolve: () => void) {
    if (signal && signal.aborted) {
      if (!this.#hasEmittedEndEventOnAbort) {
        this.emit('end', { aborted: true, message: 'Download aborted' });
        this.#hasEmittedEndEventOnAbort = true;
      }
      resolve();
      return true;
    }
    return false;
  }

  protected logWriteTextFileResult(result: WriteTextFileResult, target: {id: string}, targetName: string) {
    switch (result.status) {
      case 'completed':
        this.log('info', `Saved ${targetName} to "${result.filePath}"`);
        break;
      case 'skipped':
        this.log('warn', `Skipped saving ${targetName} #${target.id}: ${result.message}`);
        break;
      case 'error':
        this.log('error', `Error saving ${targetName} #${target.id} to "${result.filePath}":`, result.error);
    }
  }

  protected async commonFetchAPI(url: string, signal?: AbortSignal) {
    let json, requestAPIError: any;
    try {
      json = await this.fetcher.get({ url, type: 'json', maxRetries: this.config.request.maxRetries, signal });
    }
    catch (error) {
      if (signal?.aborted) {
        this.log('warn', 'API request aborted');
      }
      else {
        this.log('error', `Error requesting API URL "${url}": `, error);
        requestAPIError = error;
      }
      json = null;
    }
    return { json, error: requestAPIError };
  }

  protected fetchCampaign(campaignId: string, signal?: AbortSignal) {
    const url = URLHelper.constructCampaignAPIURL(campaignId);
    this.log('debug', `Fetch campaign data from API URL "${url}"`);
    return this.commonFetchAPI(url, signal);
  }

  protected fetchUser(userId: string, signal?: AbortSignal) {
    const url = URLHelper.constructUserAPIURL(userId);
    this.log('debug', `Fetch user data from API URL "${url}"`);
    return this.commonFetchAPI(url, signal);
  }

  on<T extends DownloaderEvent>(event: T, listener: (args: DownloaderEventPayloadOf<T>) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once<T extends DownloaderEvent>(event: T, listener: (args: DownloaderEventPayloadOf<T>) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  off<T extends DownloaderEvent>(event: T, listener: (args: DownloaderEventPayloadOf<T>) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }

  emit<T extends DownloaderEvent>(event: T, args: DownloaderEventPayloadOf<T>): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}
