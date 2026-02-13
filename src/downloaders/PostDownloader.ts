import URLHelper from '../utils/URLHelper.js';
import Downloader, { type DownloaderConfig, type DownloaderStartParams } from './Downloader.js';
import PostParser from '../parsers/PostParser.js';
import { type Collection, type Post } from '../entities/Post.js';
import { type Downloadable, isYouTubeEmbed } from '../entities/Downloadable.js';
import StatusCache, { type StatusCacheValidationScope } from './cache/StatusCache.js';
import { generatePostEmbedSummary, generatePostSummary } from './templates/PostInfo.js';
import path from 'path';
import { TargetSkipReason } from './DownloaderEvent.js';
import DownloadTaskFactory from './task/DownloadTaskFactory.js';
import PostsFetcher from './PostsFetcher.js';
import CommentParser from '../parsers/CommentParser.js';
import { type Comment, type CommentList, type CommentReply, type CommentReplyList } from '../entities/Comment.js';
import { generatePostCommentsSummary } from './templates/CommentInfo.js';
import { type PostDirectories } from '../utils/FSHelper.js';
import { type DBInstance } from '../browse/db/index.js';
import { type AttachmentMediaItem } from '../entities/MediaItem.js';
import type Logger from '../utils/logging/Logger.js';
import { type DeepRequired } from '../utils/Misc.js';
import { type Campaign } from '../entities/Campaign.js';
import type DownloadTaskBatch from './task/DownloadTaskBatch.js';
import { generateCollectionSummary } from './templates/CollectionInfo.js';

export interface PostDownloaderContext {
  skipSaveCampaign?: boolean;
  keepLoggerOpen?: boolean;
  keepDBOpen?: boolean;
}

export default class PostDownloader extends Downloader<Post> {

  static version = '1.1.1';

  name = 'PostDownloader';

  #startPromise: Promise<void> | null = null;
  #context: DeepRequired<PostDownloaderContext>;

  constructor(
    config: DownloaderConfig<Post>,
    db: () => Promise<DBInstance>,
    logger?: Logger | null,
    context?: PostDownloaderContext
  ) {
    super(config, db, logger);
    this.#context = {
      skipSaveCampaign: context?.skipSaveCampaign ?? false,
      keepLoggerOpen: context?.keepLoggerOpen ?? false,
      keepDBOpen: context?.keepDBOpen ?? false
    };
  }

  doStart(params?: DownloaderStartParams): Promise<void> {
    if (this.#startPromise) {
      throw Error('Downloader already running');
    }
    this.#startPromise = this.#doStart(params)
      .finally(() => {
        this.#startPromise = null;
      });
    return this.#startPromise;
  }

  async #doStart(params?: DownloaderStartParams): Promise<void> {
    try {
      const { signal } = params || {};
      const postFetch = this.config.postFetch;
      const db = await this.db();

      if (this.checkAbortSignal(signal)) {
        return;
      }

      if (postFetch.type === 'byUser') {
        this.log('info', `Targeting posts by '${postFetch.vanity}'`);
      }
      else if (postFetch.type === 'byUserId') {
        this.log('info', `Targeting posts by user #${postFetch.userId}`);
      }
      else if (postFetch.type === 'byCollection') {
        this.log('info', `Targeting posts in collection #${postFetch.collectionId}`);
      }
      else if (postFetch.type === 'byFile') {
        this.log('info', `Target post given by API data in "${postFetch.filePath}"`);
      }
      else { // Single
        this.log('info', `Targeting post #${postFetch.postId}`);
      }
      if (this.#isFetchingMultiplePosts(postFetch) && postFetch.filters) {
        const filterStr = Object.entries(postFetch.filters).map(([ key, value ]) => `${key}=${value}`).join('; ');
        if (filterStr) {
          this.log('info', `Filters: ${filterStr}`);
        }
      }

      // Step 1: Get posts (if by user) or target post
      const postsFetcher = new PostsFetcher({
        config: this.config,
        fetcher: this.fetcher,
        logger: this.logger,
        signal
      });
      postsFetcher.on('statusChange', ({current}) => {
        if (current.status === 'running') {
          this.emit('fetchBegin', { targetType: postsFetcher.getTargetType() });
        }
      });
      postsFetcher.begin();

      // Step 2: download posts in each fetched list
      let downloaded = 0;
      let skippedUnviewable = 0;
      let skippedRedundant = 0;
      let skippedUnmetMediaTypeCriteria = 0;
      let skippedNotInTier = 0;
      let skippedPublishDateOutOfRange = 0;
      let campaignSaved = false;
      let stopConditionMet = false;
      const savedCollectionIds: string[] = [];
      const postsParser = new PostParser(this.logger);
      while (postsFetcher.hasNext()) {
        const { list, aborted, error } = await postsFetcher.next();
        if (!list || aborted) {
          break;
        }
        if (!list && error) {
          this.emit('end', { aborted: false, error, message: 'PostsFetcher error' });
          return;
        }
        if (!this.#context.skipSaveCampaign && !campaignSaved && list.items[0]?.campaign) {
          await this.saveCampaignInfo(list.items[0].campaign, signal);
          campaignSaved = true;
          if (this.checkAbortSignal(signal)) {
            return;
          }
        }

        for (const _post of list.items) {

          if (stopConditionMet) {
            break;
          }

          let post = _post;

          // Collections
          if (post.campaign && post.collections) {
            for (const collection of post.collections) {
              if (!savedCollectionIds.includes(collection.id)) {
                try {
                  await this.#saveCollection(collection, post.campaign);
                  savedCollectionIds.push(collection.id);
                }
                catch (error) {
                  this.log('error', `Failed to save collection #${collection.id}:`, error);
                }
              }
              else {
                this.log('debug', `Collection #${collection.id} already processed`);
              }
            }
          }

          if (this.#isFetchingMultiplePosts(postFetch)) {
            // Refresh to ensure media links have not expired
            this.log('debug', `Refresh post #${_post.id}`);
            const postURL = URLHelper.constructPostsAPIURL({ postId: _post.id });
            const { json } = await this.commonFetchAPI(postURL, signal);
            let refreshed: Post | null = null;
            if (json) {
              refreshed = postsParser.parsePostsAPIResponse(json, postURL).items[0] || null;
              if (!refreshed) {
                this.log('warn', `Refreshed post #${_post.id} but got empty value - going to use existing data`);
              }
              else if (refreshed.id !== _post.id) {
                this.log('warn', `Refreshed post #${_post.id} but ID mismatch - going to use existing data`);
                refreshed = null;
              }
            }
            else if (this.checkAbortSignal(signal)) {
              return;
            }
            else {
              this.log('warn', `Failed to refresh post #${_post.id} - going to use existing data`);
            }
            if (refreshed) {
              this.log('debug', `Use refreshed post data #${refreshed.id}`);
              post = refreshed;
            }
          }

          this.emit('targetBegin', { target: post });

          // Step 4.1: post directories
          const postDirs = this.fsHelper.getPostDirs(post);
          this.log('debug', 'Post directories:', postDirs);

          // Step 4.2: Check with status cache
          const statusCache = StatusCache.getInstance(this.config, postDirs.statusCache, this.logger);
          const statusCacheValidation = statusCache.validate(post, postDirs.root, this.config)
          if (!statusCacheValidation.invalidated) {
            this.log('info', `Skipped downloading post #${post.id}: already downloaded and nothing has changed since last download`);
            this.emit('targetEnd', {
              target: post,
              isSkipped: true,
              skipReason: TargetSkipReason.AlreadyDownloaded,
              skipMessage: 'Target already downloaded and nothing has changed since last download'
            });
            skippedRedundant++;
            if (this.config.stopOn === 'postPreviouslyDownloaded' || 
              this.config.stopOn === 'previouslyDownloaded'
            ) {
              stopConditionMet = true;
            }
            continue;
          }
          
          switch ((await this.#doDownload(
            post,
            postDirs,
            statusCacheValidation.scope,
            statusCache,
            db,
            signal
          )).status) {
            case 'aborted':
              return;
            case 'downloaded':
              downloaded++;
              break;
            case 'skippedNotInTier':
              skippedNotInTier++;
              break;
            case 'skippedPublishDateOutOfRange':
              skippedPublishDateOutOfRange++;
              if (this.config.stopOn === 'postPublishDateOutOfRange' ||
                this.config.stopOn === 'publishDateOutOfRange'
              ) {
                stopConditionMet = true;
              }
              break;
            case 'skippedUnmetMediaTypeCriteria':
              skippedUnmetMediaTypeCriteria++;
              break;
            case 'skippedUnviewable':
              skippedUnviewable++;
              break;
          }

          if (this.checkAbortSignal(signal)) {
            return;
          }
        }

        if (stopConditionMet) {
          break;
        }
      }

      if (this.checkAbortSignal(signal)) {
        return;
      }

      if (stopConditionMet && this.#isFetchingMultiplePosts(postFetch)) {
        this.log('info', `Stop downloader: stop condition "${this.config.stopOn}" met`)
      }

      // Done
      if (postFetch.type === 'byUser') {
        this.log('info', `Done downloading posts by '${postFetch.vanity}'`);
      }
      else if (postFetch.type === 'byUserId') {
        this.log('info', `Done downloading posts by user #${postFetch.userId}`);
      }
      else if (postFetch.type === 'byCollection') {
        this.log('info', `Done downloading posts in collection #${postFetch.collectionId}`);
      }
      else if (postFetch.type === 'byFile') {
        this.log('info', `Done downloading post given in "${postFetch.filePath}"`);
      }
      else {
        this.log('info', `Done downloading post #${postFetch.postId}`);
      }
      let endMessage = 'Done';
      if (this.#isFetchingMultiplePosts(postFetch)) {
        const skippedStrParts: string[] = [];
        if (skippedUnviewable) {
          skippedStrParts.push(`${skippedUnviewable} unviewable`);
        }
        if (skippedRedundant) {
          skippedStrParts.push(`${skippedRedundant} redundant`);
        }
        if (skippedUnmetMediaTypeCriteria) {
          skippedStrParts.push(`${skippedUnmetMediaTypeCriteria} with unmet media type criteria`);
        }
        if (skippedNotInTier) {
          skippedStrParts.push(`${skippedNotInTier} not in tier`);
        }
        if (skippedPublishDateOutOfRange) {
          skippedStrParts.push(`${skippedPublishDateOutOfRange} with publish date out of range`);
        }
        const skippedStr = skippedStrParts.length > 0 ? ` (skipped: ${skippedStrParts.join(', ')})` : '';
        endMessage = `Total ${downloaded} / ${postsFetcher.getTotal()} posts processed${skippedStr}`;
        this.log('info', endMessage);
      }
      this.emit('end', { aborted: false, message: endMessage });
    }
    finally {
      if (!this.#context.keepDBOpen) {
        await this.closeDB();
      }
      if (this.logger && !this.#context.keepLoggerOpen) {
        await this.logger.end();
      }
    }
  }

  async #doDownload(
    post: Post,
    postDirs: PostDirectories,
    scope: StatusCacheValidationScope<Post>,
    statusCache: StatusCache,
    db: DBInstance,
    signal?: AbortSignal
  ): Promise<{status: 'skippedUnviewable' | 'skippedUnmetMediaTypeCriteria' | 'skippedNotInTier' | 'skippedPublishDateOutOfRange' | 'aborted' | 'downloaded' }> {
    this.log('info', `Download post #${post.id} (${post.title})`);

    const downloadPost = scope.includes('post');
    const downloadComments = scope.includes('comments');
      
    // Step 1: Check whether we should download post
    // -- 1.1 Viewability
    if (!post.isViewable) {
      if (this.config.include.lockedContent) {
        this.log('warn', `Post #${post.id} is not viewable by current user`);
      }
      else {
        this.log('warn', `Skipped downloading post #${post.id}: not viewable by current user`);
        this.emit('targetEnd', {
          target: post,
          isSkipped: true,
          skipReason: TargetSkipReason.Inaccessible,
          skipMessage: 'Target is not viewable by current user'
        });
        return {
          status: 'skippedUnviewable'
        };
      }
    }

    // -- 1.2 Config option 'include.postsWithMediaType'
    const postsWithMediaType = this.config.include.postsWithMediaType;
    if (postsWithMediaType !== 'any') {
      const hasAttachments = post.attachments.length > 0;
      const hasAudio = !!post.audio || !!post.audioPreview;
      const hasImages = post.images.length > 0;
      const hasVideo = !!post.video || !!post.videoPreview || !!(post.embed && (post.embed.type === 'videoEmbed' || isYouTubeEmbed(post.embed)));
      const isPodcast = post.postType === 'podcast'

      let skip = false;
      if (postsWithMediaType === 'none') {
        skip = hasAttachments || hasAudio || hasImages || hasVideo;
      }
      else if (Array.isArray(postsWithMediaType)) {
        skip = !(
          (postsWithMediaType.includes('attachment') && hasAttachments) ||
          (postsWithMediaType.includes('audio') && hasAudio) ||
          (postsWithMediaType.includes('image') && hasImages) ||
          (postsWithMediaType.includes('video') && hasVideo) ||
          (postsWithMediaType.includes('podcast') && isPodcast && (hasAudio || hasVideo)));
      }

      if (skip) {
        this.log('warn', `Skipped downloading post #${post.id}: unmet media type criteria`);
        this.log('debug', 'Match criteria failed:', `config.include.postsWithMediaType: ${JSON.stringify(postsWithMediaType)} <-> post #${post.id}:`, {
          hasAttachments,
          hasAudio,
          hasImages,
          hasVideo
        });
        this.emit('targetEnd', {
          target: post,
          isSkipped: true,
          skipReason: TargetSkipReason.UnmetMediaTypeCriteria,
          skipMessage: 'Target does not meet media type criteria'
        });
        return {
          status: 'skippedUnmetMediaTypeCriteria'
        };
      }
    }

    // -- 1.3 Config option 'include.postsInTier'
    const postsInTier = this.config.include.postsInTier;
    const isAnyTier = postsInTier === 'any' || postsInTier.includes('any');
    if (!isAnyTier) {
      const applicableTierIds = postsInTier.filter((id) => post.campaign?.rewards.find((r) => r.id === id));
      if (!post.campaign) {
        this.log('warn', 'config.include.postsInTier: ignored - post missing campaign info');
      }
      else {
        this.log('debug', 'config.include.postsInTier: applicable tier IDs:', applicableTierIds);
      }
      let skip = false;
      if (!post.campaign) {
        skip = false;
      }
      else if (applicableTierIds.length === 0) {
        skip = true;
      }
      else if (!post.tiers.find((tier) => tier.id === 'patrons')) {
        skip = applicableTierIds.every((id) => !post.tiers.find((tier) => tier.id === id));
      }
      if (skip) {
        this.log('warn', `Skipped downloading post #${post.id}: not in tier`);
        this.log('debug', 'Match criteria failed:', `config.include.postsInTier: ${JSON.stringify(applicableTierIds)} <-> post #${post.id}:`, post.tiers);
        this.emit('targetEnd', {
          target: post,
          isSkipped: true,
          skipReason: TargetSkipReason.NotInTier,
          skipMessage: 'Target not in tier'
        });
        return {
          status: 'skippedNotInTier'
        };
      }
      if (post.campaign) {
        this.log('debug', 'Match criteria OK:', `config.include.postsInTier: ${JSON.stringify(applicableTierIds)} <-> post #${post.id}:`, post.tiers);
      }
    }

    // -- 1.4 Config option 'include.postsPublished'
    if (this.isPublishDateOutOfRange(post)) {
      return {
        status: 'skippedPublishDateOutOfRange'
      };
    }

    if (!downloadPost && downloadComments) {
      this.log('info', `Previously downloaded post #${post.id} - refresh comments only`);
    }

    let hasDownloadPostError = false;
    if (downloadPost) {
      // Step 2: Save post info
      if (this.config.include.contentInfo) {
        this.log('info', `Save post info #${post.id}`);
        this.emit('phaseBegin', { target: post, phase: 'saveInfo' });
        this.fsHelper.createDir(postDirs.info);
        // Post raw data might not be complete or consistent with other posts in the collection.
        // Fetch directly from API.
        // Strictly speaking, we should check for 'error' in results, but since it's not going to be fatal we'll just skip it.
        const { json: fetchedPostAPIData } = await this.commonFetchAPI(
          URLHelper.constructPostsAPIURL({
            postId: post.id,
            campaignId: post.campaign?.id
          }),
          signal
        );

        if (this.checkAbortSignal(signal)) {
          return {
            status: 'aborted'
          };
        }

        // Step 3. Save summary and raw json
        const summary = generatePostSummary(post);
        const summaryFile = path.resolve(postDirs.info, 'info.txt');
        const saveSummaryResult = await this.fsHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
        this.logWriteTextFileResult(saveSummaryResult, post, 'post summary');

        const postRawFile = path.resolve(postDirs.info, 'post-api.json');
        const savePostRawResult = await this.fsHelper.writeTextFile(
          postRawFile, fetchedPostAPIData || post.raw, this.config.fileExistsAction.infoAPI);
        this.logWriteTextFileResult(savePostRawResult, post, 'post API data');
        this.emit('phaseEnd', { target: post, phase: 'saveInfo' });

        // (Downloading of info media items deferred to the next step)
      }

      if (this.config.include.previewMedia || this.config.include.contentMedia) {
        this.emit('phaseBegin', { target: post, phase: 'saveMedia' });
      }

      // Step 4: save embed info
      if (post.embed && this.config.include.contentMedia) {
        this.log('info', `Save embed info of post #${post.id}`);
        this.fsHelper.createDir(postDirs.embed);
        const embedSummary = generatePostEmbedSummary(post.embed);
        let embedFilename;
        switch (post.embed.type) {
          case 'videoEmbed':
            embedFilename = 'embedded-video.txt';
            break;
          case 'linkEmbed':
            embedFilename = 'embedded-link.txt';
            break;
          default:
            embedFilename = 'embedded-unknown.txt';
        }
        const embedFile = path.resolve(postDirs.embed, embedFilename);
        const saveSummaryResult = await this.fsHelper.writeTextFile(embedFile, embedSummary, this.config.fileExistsAction.content);
        this.logWriteTextFileResult(saveSummaryResult, post, 'embed info');
      }

      // Step 5: create download tasks
      let createTaskErrorCount = 0;
      if (this.config.include.previewMedia ||
        this.config.include.contentMedia ||
        this.config.include.contentInfo) {

        const batchResult = await this.#createDownloadTaskBatchForPost(post, postDirs, signal);
        const { batch } = batchResult;    
        createTaskErrorCount += batchResult.errorCount;

        const abortHandler = () => {
          void (async () => {
            this.log('info', 'Abort signal received');
            if (batch) {
              await batch.abort();
            }
          })();
        };
        if (signal) {
          signal.addEventListener('abort', abortHandler, { once: true });
        }

        try {
          if (this.checkAbortSignal(signal)) {
            return {
              status: 'aborted'
            };
          }
    
          if (this.config.include.contentInfo) {
            const infoElements: Downloadable[] = [];
            if (post.coverImage) {
              infoElements.push(post.coverImage);
            }
            if (post.thumbnail) {
              infoElements.push(post.thumbnail);
            }
            if (infoElements.length > 0) {
              const { errorCount } = await this.addToDownloadTaskBatch(batch,
                signal,
                {
                  target: infoElements,
                  targetName: `post #${post.id} -> info elements`,
                  dirs: {
                    campaign: post.campaign ? this.fsHelper.getCampaignDirs(post.campaign).root : null,
                    main: postDirs.info,
                    thumbnails: postDirs.thumbnails
                  },
                  fileExistsAction: this.config.fileExistsAction.info
                }
              );
              createTaskErrorCount += errorCount;
            }
          }
    
          if (this.checkAbortSignal(signal)) {
            return {
              status: 'aborted'
            };
          }
    
          batch.prestart();
          this.log('info', `Download batch created (#${batch.id}): ${batch.getTasks('pending').length} downloads pending`);
          this.emit('phaseBegin', { target: post, phase: 'batchDownload', batch });
    
          await batch.start();

          hasDownloadPostError = batch.getTasks('error').length > 0 || createTaskErrorCount > 0;

          await batch.destroy();
        }
        finally {
          if (signal) {
            signal.removeEventListener('abort', abortHandler);
          }
        }

        this.emit('phaseEnd', { target: post, phase: 'batchDownload'});
      }

      if (this.config.include.previewMedia || this.config.include.contentMedia) {
        this.emit('phaseEnd', { target: post, phase: 'saveMedia' });
      }
    }

    if (this.checkAbortSignal(signal)) {
      return {
        status: 'aborted'
      };
    }

    // Step 6: Fetch and save comments (only available if post is viewable)
    let comments: Comment[] | null = null;
    if (downloadComments && this.config.include.comments && post.isViewable) {
      if (post.commentCount > 0) {
        comments = await this.#fetchComments(post, signal);
        if (this.checkAbortSignal(signal)) {
          return {
            status: 'aborted'
          };
        }
        if (comments.length > 0) {
          this.fsHelper.createDir(postDirs.info);
          const commentsFile = path.resolve(postDirs.info, 'comments.txt');
          const commentsSummary = generatePostCommentsSummary(comments);
          const saveCommentsResult = await this.fsHelper.writeTextFile(commentsFile, commentsSummary, this.config.fileExistsAction.info);
          this.logWriteTextFileResult(saveCommentsResult, post, `${comments.length} comments`);
        }
        else {
          this.log('warn', `Expecting ${post.commentCount} comments for post #${post.id} but got none`);
        }
      }
      else {
        this.log('info', `No comments available for post #${post.id}`)
      }
    }

    // Step 7: Update status cache
    statusCache.updateOnDownload(post, postDirs.root, hasDownloadPostError, this.config);

    // Step 8: Save to DB
    let skipDB = false;
    if (!post.isViewable) {
      // Skip if existing db record (if any) refers to viewable post
      const dbPost = db.getContent(post.id, 'post');
      skipDB = dbPost !== null && dbPost.isViewable;
    }
    if (!skipDB) {
      db.saveContent(post);
      if (comments) {
        db.savePostComments(post, comments);
      }
    }
    else {
      this.log('info', `Skip overwrite existing viewable post #${post.id} in DB with current unviewable version`);
    }

    this.emit('targetEnd', { target: post, isSkipped: false });

    return {
      status: 'downloaded'
    };
  }

  #isFetchingMultiplePosts(postFetch: DownloaderConfig<Post>['postFetch']): postFetch is DownloaderConfig<Post>['postFetch'] & { type: 'byUser' | 'byUserId' | 'byCollection' } {
    return postFetch.type === 'byUser' || postFetch.type === 'byUserId' || postFetch.type === 'byCollection';
  }

  async __getCampaign(signal?: AbortSignal) {
    let url: string | null;
    const postFetch = this.config.postFetch;
    switch (postFetch.type) {
      case 'byUser':
        url = URLHelper.constructCampaignPageURL({ vanity: postFetch.vanity });
        break;
      case 'byUserId':
        url = URLHelper.constructCampaignPageURL({ userId: postFetch.userId });
        break;
      default:
        url = null;
    }
    if (!url) {
      throw Error('Internal error: invalid config');
    }
    const postsFetcher = new PostsFetcher({
      config: this.config,
      fetcher: this.fetcher,
      logger: this.logger,
      signal
    });
    const { campaignId } = await postsFetcher.getInitialData(url);
    const postsParser = new PostParser(this.logger);
    const res = await this.fetchCampaign(campaignId);
    if (signal?.aborted) {
      throw new Error('Aborted');
    }
    if (res.error) {
      throw res.error;
    }
    return postsParser.parseCampaignAPIResponse(res.json);
  }

  async #createDownloadTaskBatchForPost(post: Post, postDirs: ReturnType<typeof this.fsHelper['getPostDirs']>, signal?: AbortSignal) {

    const incPreview = this.config.include.previewMedia;
    const incContent = this.config.include.contentMedia;

    const __incPreview = (mediaType: 'audio' | 'video' | 'image') => {
      if (typeof incPreview === 'boolean') {
        return incPreview;
      }
      return incPreview.includes(mediaType);
    };

    const __incContent = (mediaType: 'audio' | 'video' | 'image' | 'attachment') => {
      if (typeof incContent === 'boolean') {
        return incContent;
      }
      return incContent.includes(mediaType);
    };

    const __getEmbedTask = () => {
      if (!post.embed) {
        return null;
      }

      const hasEmbedDownloader = DownloadTaskFactory.findEmbedDownloader(this.config.embedDownloaders, post.embed.provider);
      const isDownloadableVideo = isYouTubeEmbed(post.embed) || (post.embed.type === 'videoEmbed' && hasEmbedDownloader);
      const isDownloadableOther = !isYouTubeEmbed(post.embed) && post.embed.type !== 'videoEmbed' && hasEmbedDownloader;
      
      if ((isDownloadableVideo && __incContent('video')) || isDownloadableOther) {
        const embedType = post.embed.type === 'videoEmbed' ? ' video' : post.embed.type === 'linkEmbed' ? ' link' : '';
        return {
          target: [ post.embed ],
          targetName: `post #${post.id} -> embedded ${post.embed.provider}${embedType}`,
          dirs: {
            campaign: post.campaign ? this.fsHelper.getCampaignDirs(post.campaign).root : null,
            main: postDirs.embed,
            thumbnails: postDirs.thumbnails
          },
          fileExistsAction: this.config.fileExistsAction.content
        };
      }
      
      return null;
    }

    const campaignDir = post.campaign ? this.fsHelper.getCampaignDirs(post.campaign).root : null;

    await this.#processLinkedAttachments(post);
    const downloadableLinkedAttachments = post.linkedAttachments?.reduce<Downloadable<AttachmentMediaItem>[]>((result, att) => {
      if (att.downloadable) {
        result.push(att.downloadable);
      }
      return result;
    }, []) || [];

    const allAttachments = [...post.attachments, ...downloadableLinkedAttachments];

    const batchResult = this.createDownloadTaskBatch(
      `Post #${post.id} (${post.title})`,
      signal,

      __incPreview('audio') && post.audioPreview ? {
        target: [ post.audioPreview ],
        targetName: `post #${post.id} -> audio preview`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.audioPreview,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incPreview('video') && post.videoPreview ? {
        target: [ post.videoPreview ],
        targetName: `post #${post.id} -> video preview`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.videoPreview,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      /**
       * If post is not viewable by current user, its images will be
       * blurry and we should categorize them as image previews.
       */
      __incPreview('image') && post.images.length > 0 && !post.isViewable ? {
        target: post.images,
        targetName: `post #${post.id} -> image previews`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.imagePreviews,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      /**
       * If post is not viewable, audio data should have no URL, so check and
       * skip if this is the case.
       */
      __incContent('audio') && post.audio && (post.isViewable || (post.audio.type === 'audio' && post.audio.url)) ? {
        target: [ post.audio ],
        targetName: `post #${post.id} -> audio`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.audio,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('video') && post.video ? {
        target: [ post.video ],
        targetName: `post #${post.id} -> video`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.video,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('image') && post.images.length > 0 && post.isViewable ? {
        target: post.images,
        targetName: `post #${post.id} -> images`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.images,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('attachment') && allAttachments.length > 0 ? {
        target: allAttachments,
        targetName: `post #${post.id} -> attachments`,
        dirs: {
          campaign: campaignDir,
          main: postDirs.attachments,
          thumbnails: postDirs.thumbnails
        },
        fileExistsAction: this.config.fileExistsAction.content,
        isAttachment: true
      } : null,

      __getEmbedTask()
    );

    return batchResult;
  }

  async #processLinkedAttachments(post: Post, signal?: AbortSignal) {
    if (!post.linkedAttachments || post.linkedAttachments.length === 0) {
      return;
    }
    this.log('debug', `Process linked attachments of post #${post.id}`);
    for (const la of post.linkedAttachments) {
      const laStr = `[#${post.id} -> #${la.mediaId}]`;
      // Only process linked attachment where its postId is not the same as current one being processed.
      // If same as current one, then linked attachment would already be in the current post data.
      if (la.postId === post.id) {
        this.log('debug', `Linked attachment ${laStr} has same parent post`);
      }
      else {
        const apiURL = URLHelper.constructPostsAPIURL({ postId: la.postId });
        let json;
        try {
          this.log('debug', `Linked attachment ${laStr} belongs to post #${la.postId}`);
          json = (await this.fetcher.get({
            url: apiURL,
            type: 'json',
            maxRetries: this.config.request.maxRetries,
            signal }
          )).json;
        }
        catch (error) {
          if (signal?.aborted) {
            throw error;
          }
          else {
            this.log('error', `Error fetching linked attachment ${laStr} from parent post #${la.postId}: API request failed for "${apiURL}": `, error);
          }
          json = null;
        }
        if (json) {
          const parser = new PostParser();
          const parentPost = parser.parsePostsAPIResponse(json, apiURL).items[0];
          if (!parentPost) {
            this.log('error', `Error fetching linked attachment ${laStr} from parent post #${la.postId}: post data not found in response of "${apiURL}"`);
          }
          else {
            if (!parentPost.isViewable) {
              this.log('warn', `Parent post #${la.postId} of linked attachment ${laStr} is not viewable by user`);
            }
            else {
              const attachment = parentPost.attachments.find((att) => att.id === la.mediaId);
              if (!attachment) {
                this.log('warn', `Attachment not found in parent post #${la.postId} of linked attachment ${laStr}`);
              }
              else {
                la.downloadable = attachment;
                this.log('debug', `Obtained attachment from parent post #${la.postId} of linked attachment ${laStr}`);
              }
            }
          }
        }
      }
    }
  }

  async #fetchComments(post: Post, signal?: AbortSignal, accumulated?: CommentList & { nextURL: string; }): Promise<Comment[]> {
    if (!post.commentCount) {
      this.log('debug', `Comment count is zero for post #${post.id}`);
      return [];
    }
    if (this.checkAbortSignal(signal)) {
      return [];
    }
    let commentsURL;
    if (!accumulated) {
      this.log('info', `Fetch comments for post #${post.id}`);
      commentsURL = URLHelper.constructPostCommentsAPIURL({ postId: post.id });
    }
    else {
      this.log('debug', `Fetch next batch of comments for post #${post.id}`);
      commentsURL = accumulated.nextURL;
    }
    const { json } = await this.commonFetchAPI(commentsURL, signal);
    const parser = new CommentParser(this.logger);
    if (json) {
      const comments = parser.parseCommentsAPIResponse(json, commentsURL);
      this.log('debug', `Fetched ${comments.items.length} comments for post #${post.id}`);
      if (comments.items.length > 0 && comments.nextURL) {
        let _acc;
        if (!accumulated) {
          _acc = {
            url: comments.url,
            items: comments.items,
            nextURL: comments.nextURL,
            total: comments.total
          };
        }
        else {
          _acc = accumulated;
          _acc.url = comments.url;
          _acc.items.push(...comments.items);
          _acc.nextURL = comments.nextURL;
        }
        return this.#fetchComments(post, signal, _acc);
      }
      else {
        const result = accumulated ? [ ...accumulated.items, ...comments.items ] : comments.items;
        this.log('debug', `Total ${result.length} comments fetched for post #${post.id}`);
        for (const comment of result) {
          if (comment.replyCount > 0) {
            comment.replies = await this.#fetchCommentReplies(comment, signal);
          }
        }
        return result;
      }
    }
    else if (this.checkAbortSignal(signal)) {
      return [];
    }
    else {
      this.log('warn', `Failed to fetch comments for post #${post.id}`);
      return [];
    }
  }

  async #fetchCommentReplies(comment: Comment, signal?: AbortSignal, accumulated?: CommentReplyList & { nextURL: string; }): Promise<CommentReply[]> {
    if (!comment.replyCount) {
      this.log('debug', `Reply count is zero for comment #${comment.id}`);
      return [];
    }
    if (this.checkAbortSignal(signal)) {
      return [];
    }
    let repliesURL;
    if (!accumulated) {
      this.log('debug', `Fetch replies to comment #${comment.id}`);
      repliesURL = URLHelper.constructPostCommentsAPIURL({ commentId: comment.id, replies: true });
    }
    else {
      this.log('debug', `Fetch next batch of replies to comment #${comment.id}`);
      repliesURL = accumulated.nextURL;
    }
    const { json } = await this.commonFetchAPI(repliesURL, signal);
    const parser = new CommentParser(this.logger);
    if (json) {
      const replies = parser.parseCommentsAPIResponse(json, repliesURL, true);
      this.log('debug', `Fetched ${replies.items.length} replies to comment #${comment.id}`);
      if (replies.items.length > 0 && replies.nextURL) {
        let _acc;
        if (!accumulated) {
          _acc = {
            url: replies.url,
            items: replies.items,
            nextURL: replies.nextURL,
            total: replies.total
          };
        }
        else {
          _acc = accumulated;
          _acc.url = replies.url;
          _acc.items.push(...replies.items);
          _acc.nextURL = replies.nextURL;
        }
        return this.#fetchCommentReplies(comment, signal, _acc);
      }
      else {
        const result = accumulated ? [ ...accumulated.items, ...replies.items ] : replies.items;
        this.log('debug', `Total ${result.length} replies fetched for comment #${comment.id}`);
        return result;
      }
    }
    else if (this.checkAbortSignal(signal)) {
      return [];
    }
    else {
      this.log('warn', `Failed to fetch replies to comment #${comment.id}`);
      return [];
    }
  }

  async #saveCollection(collection: Collection, campaign: Campaign, signal?: AbortSignal) {
    const db = await this.db();
    if (this.checkAbortSignal(signal)) {
      return;
    }

    if (!this.config.include.contentInfo) {
      db.saveCollection(collection, campaign);
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

    this.log('info', `Save collection info #${collection.id}`);
    this.emit('targetBegin', { target: collection });
    this.emit('phaseBegin', { target: collection, phase: 'saveInfo' });

    // Step 1: create collection directories
    const collectionDirs = this.fsHelper.getCollectionsDir(campaign, collection);
    this.log('debug', 'Campaign directories: ', collectionDirs);
    this.fsHelper.createDir(collectionDirs.root);

    // Step 2: save summary and raw json
    const summary = generateCollectionSummary(collection);
    const summaryFile = path.resolve(collectionDirs.root, 'info.txt');
    const saveSummaryResult = await this.fsHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
    this.logWriteTextFileResult(saveSummaryResult, collection, 'collection summary');

    const collectionRawFile = path.resolve(collectionDirs.root, 'collection-api.json');
    const saveCollectionRawResult = await this.fsHelper.writeTextFile(
      collectionRawFile, collection.raw, this.config.fileExistsAction.infoAPI);
    this.logWriteTextFileResult(saveCollectionRawResult, collection, 'collection API data');

    this.emit('phaseEnd', { target: collection, phase: 'saveInfo' });

    if (this.checkAbortSignal(signal)) {
      return;
    }

    // Step 3: download collection media items
    if (collection.thumbnail) {
      this.emit('phaseBegin', { target: collection, phase: 'saveMedia' });
      const collectionMedia: Downloadable[] = [
        collection.thumbnail
      ];
      batch = (await this.createDownloadTaskBatch(
        `Collection #${collection.id} (${collection.title})`,
        signal,
        {
          target: collectionMedia,
          targetName: `collection #${campaign.id} -> thumbnail`,
          dirs: {
            campaign: this.fsHelper.getCampaignDirs(campaign).root,
            main: collectionDirs.root,
            thumbnails: null
          },
          fileExistsAction: this.config.fileExistsAction.info
        }
      )).batch;
      if (this.checkAbortSignal(signal)) {
        return;
      }
      batch.prestart();
      this.emit('phaseBegin', { target: collection, phase: 'batchDownload', batch });
      await batch.start();
      await batch.destroy();
      this.emit('phaseEnd', { target: collection, phase: 'batchDownload' });
      this.emit('phaseEnd', { target: collection, phase: 'saveMedia' });

      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }
      if (this.checkAbortSignal(signal)) {
        return;
      }
    }

    // Step 4: save to DB
    db.saveCollection(collection, campaign);

    // Done
    this.log('info', 'Done saving collection info');
    this.emit('targetEnd', { target: collection, isSkipped: false });
  }

}
