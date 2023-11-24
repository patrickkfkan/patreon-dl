import fs from 'fs';
import { EventEmitter } from 'events';
import deepFreeze from 'deep-freeze';
import Fetcher from '../utils/Fetcher.js';
import Bootstrap, { DownloaderBootstrapData, DownloaderType } from './Bootstrap.js';
import { DownloaderInit, DownloaderOptions, FileExistsAction, getDownloaderInit } from './DownloaderOptions.js';
import { DownloaderEvent, DownloaderEventPayloadOf } from './DownloaderEvent.js';
import Logger, { LogLevel, commonLog } from '../utils/logging/Logger.js';
import { Campaign } from '../entities/Campaign.js';
import FSHelper, { WriteTextFileResult } from '../utils/FSHelper.js';
import DownloadTaskBatch from './task/DownloadTaskBatch.js';
import { IDownloadTask } from './task/DownloadTask.js';
import FFmpegDownloadTask from './task/FFmpegDownloadTask.js';
import DownloadTaskFactory from './task/DownloadTaskFactory.js';
import FilenameFormatHelper from '../utils/FilenameFormatHelper.js';
import { Downloadable } from '../entities/Downloadable.js';
import { generateCampaignSummary } from './templates/CampaignInfo.js';
import path from 'path';
import URLHelper from '../utils/URLHelper.js';
import { AbortError } from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';

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
  protected config: deepFreeze.DeepReadonly<DownloaderConfig<T>>;
  protected logger?: Logger | null;

  #hasEmittedEndEventOnAbort: boolean;

  constructor(bootstrap: DownloaderBootstrapData<T>, options?: DownloaderOptions) {
    super();
    this.#validateOptions(options);
    this.config = deepFreeze({
      ...bootstrap,
      ...getDownloaderInit(options)
    });
    if (this.config.pathToFFmpeg) {
      ffmpeg.setFfmpegPath(this.config.pathToFFmpeg);
    }
    this.fetcher = new Fetcher(options?.cookie, options?.logger);
    this.logger = options?.logger;
    this.#hasEmittedEndEventOnAbort = false;
  }

  protected createDownloadTaskBatch(name: string, ...createTasks: Array<CreateDownloadTaskParams | null>): DownloadTaskBatch {

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
      limiter: this.config.request
    });

    batch.on('taskStart', ({task}) => {
      const retryOrBeginStr = task.retryCount > 0 ? 'retry' : 'begin';
      this.log('info', `Download ${retryOrBeginStr} (${__getDownloadIdString(task, batch)}): [type: ${task.srcEntity.type}; ID: #${task.srcEntity.id}] -> ${task.resolvedDestFilename}`);
      if (task instanceof FFmpegDownloadTask) {
        const retryOrBeginStr = task.retryCount > 0 ? 'Retry' : 'Begin';
        this.log('info', `${retryOrBeginStr} downloading through FFmpeg (${__getDownloadIdString(task, batch)}): ${task.commandLine}`);
      }
    });

    batch.on('taskComplete', ({task}) => {
      this.log('info', `Download complete (${__getDownloadIdString(task, batch)}): "${task.resolvedDestPath}"`);
    });

    batch.on('taskError', ({error, willRetry}) => {
      const { task, cause } = error;
      const retryStr = willRetry ? '- will retry' : '';
      this.log('error', `Download error (${__getDownloadIdString(task, batch)}):`, cause, `(${task.src})`, retryStr);
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

    return this.addToDownloadTaskBatch(batch, ...createTasks);
  }

  protected addToDownloadTaskBatch(batch: DownloadTaskBatch, ...createTasks: Array<CreateDownloadTaskParams | null>) {
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
          const tasks = DownloadTaskFactory.createFromDownloadable({
            item: tt,
            destDir,
            fetcher: this.fetcher,
            destFilenameFormat: this.config.filenameFormat.media,
            fileExistsAction: task.fileExistsAction,
            maxRetries: this.config.request.maxRetries,
            downloadAllVariants: this.config.include.allMediaVariants,
            logger: this.logger
          });
          batch.addTasks(tasks);
          createdCount += tasks.length;
        }
        catch (error) {
          this.log('error', `Failed to create download task for item #${tt.id} in ${targetName}:`, error);
          failedCreateTaskCount++;
        }
      }
      if (createdCount > 0) {
        FSHelper.createDir(destDir);
      }
    }
    if (failedCreateTaskCount > 0) {
      this.log('warn', `${failedCreateTaskCount} items could not be processed for downloading`);
    }
    return batch;
  }

  abstract start(params: DownloaderStartParams): Promise<void>;

  static async getInstance(url: string, options?: DownloaderOptions) {
    const bootstrap = Bootstrap.getDownloaderBootstrapDataByURL(url);
    if (!bootstrap) {
      throw Error('Could not determine downloader type from URL');
    }
    switch (bootstrap.type) {
      case 'product':
        const ProductDownloader = (await import('./ProductDownloader.js')).default;
        return new ProductDownloader(bootstrap, options);
      case 'post':
        const PostDownloader = (await import('./PostDownloader.js')).default;
        return new PostDownloader(bootstrap, options);
    }
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

    return new Promise<void>(async (resolve) => {
      if (!this.config.include.campaignInfo) {
        return;
      }

      if (this.checkAbortSignal(signal, resolve)) {
        return;
      }

      let batch: DownloadTaskBatch | null = null;
      const abortHandler = async () => {
        if (batch) {
          await batch.abort();
        }
      };
      if (signal) {
        signal.addEventListener('abort', abortHandler, { once: true });
      }

      if (!campaign) {
        this.log('warn', 'Skipped saving campaign info: target unavailable');
        return;
      }

      this.log('info', `Save campaign info #${campaign.id}`);
      this.emit('targetBegin', { target: campaign });
      this.emit('phaseBegin', { target: campaign, phase: 'saveInfo' });

      // Step 1: create campaign directories
      const campaignDirs = FSHelper.getCampaignDirs(campaign, this.config);
      this.log('debug', 'Campaign directories: ', campaignDirs);
      FSHelper.createDir(campaignDirs.root);
      FSHelper.createDir(campaignDirs.info);

      // Step 2: save summary and raw json
      const summary = generateCampaignSummary(campaign);
      const summaryFile = path.resolve(campaignDirs.info, 'info.txt');
      const saveSummaryResult = await FSHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
      this.logWriteTextFileResult(saveSummaryResult, campaign, 'campaign summary');

      // Campaign / creator raw data might not be complete. Fetch directly from API.
      // Strictly speaking, we should check for 'error' in results, but since it's not going to be fatal we'll just skip it.
      const { json: fetchedCampaignAPIData } = await this.fetchCampaign(campaign.id, signal);
      const { json: fetchedCreatorAPIData } = campaign.creator ? await this.fetchUser(campaign.creator.id, signal) : { json: null };

      if (this.checkAbortSignal(signal, resolve)) {
        return;
      }

      const campaignRawFile = path.resolve(campaignDirs.info, 'campaign-api.json');
      const saveCampaignRawResult = await FSHelper.writeTextFile(
        campaignRawFile, fetchedCampaignAPIData || campaign.raw, this.config.fileExistsAction.infoAPI);
      this.logWriteTextFileResult(saveCampaignRawResult, campaign, 'campaign API data');

      if (campaign.creator) {
        const creatorRawFile = path.resolve(campaignDirs.info, 'creator-api.json');
        const saveCreatorRawResult = await FSHelper.writeTextFile(
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
      batch = this.createDownloadTaskBatch(
        `Campaign #${campaign.id} (${campaign.name})`,
        {
          target: campaignMedia,
          targetName: `campaign #${campaign.id} -> images`,
          destDir: campaignDirs.info,
          fileExistsAction: this.config.fileExistsAction.info
        }
      );
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
    });

  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.logger, level, this.name, ...msg);
  }

  getConfig() {
    return this.config;
  }

  protected checkAbortSignal(signal: AbortSignal | undefined, resolve: () => void) {
    if (signal && signal.aborted) {
      if (!this.#hasEmittedEndEventOnAbort) {
        this.emit('end', { aborted: true });
        this.#hasEmittedEndEventOnAbort = true;
      }
      resolve();
      return true;
    }
    return false;
  }

  protected logWriteTextFileResult<T>(result: WriteTextFileResult, target: T & {id: string}, targetName: string) {
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
      if (error instanceof AbortError) {
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
    return super.on(event, listener);
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
