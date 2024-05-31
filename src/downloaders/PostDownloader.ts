import { AbortError } from 'node-fetch';
import FSHelper from '../utils/FSHelper.js';
import URLHelper, { PostSortOrder } from '../utils/URLHelper.js';
import Downloader, { DownloaderConfig, DownloaderStartParams } from './Downloader.js';
import DownloadTaskBatch from './task/DownloadTaskBatch.js';
import PageParser from '../parsers/PageParser.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import PostParser from '../parsers/PostParser.js';
import { Post } from '../entities/Post.js';
import { Downloadable, isYouTubeEmbed } from '../entities/Downloadable.js';
import StatusCache from './cache/StatusCache.js';
import { generatePostEmbedSummary, generatePostSummary } from './templates/PostInfo.js';
import path from 'path';
import { TargetSkipReason } from './DownloaderEvent.js';
import DownloadTaskFactory from './task/DownloadTaskFactory.js';

export default class PostDownloader extends Downloader<Post> {

  static version = '1.1.1';

  name = 'PostDownloader';

  #startPromise: Promise<void> | null = null;

  start(params?: DownloaderStartParams): Promise<void> {

    if (this.#startPromise) {
      throw Error('Downloader already running');
    }

    this.#startPromise = new Promise<void>(async (resolve) => {

      const { signal } = params || {};
      const postFetch = this.config.postFetch;
      let batch: DownloadTaskBatch | null = null;

      if (this.checkAbortSignal(signal, resolve)) {
        return;
      }

      const abortHandler = async () => {
        this.log('info', 'Abort signal received');
        if (batch) {
          await batch.abort();
        }
      };
      if (signal) {
        signal.addEventListener('abort', abortHandler, { once: true });
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
      let postsAPIURL: string;
      try {
        postsAPIURL = await this.#getInitialPostsAPIUL(signal, resolve, resolve);
      }
      catch (error) {
        return;
      }
      if (this.#isFetchingMultiplePosts(postFetch)) {
        this.log('info', 'Fetch posts');
        this.log('debug', `Request initial posts from API URL "${postsAPIURL}"`);
        this.emit('fetchBegin', { targetType: 'posts' });
      }
      else {
        this.log('info', 'Fetch target post');
        this.log('debug', `Request post #${postFetch.postId} from API URL "${postsAPIURL}`);
        this.emit('fetchBegin', { targetType: 'post' });
      }

      const { json, error: requestAPIError } = await this.commonFetchAPI(postsAPIURL, signal);
      if (!json) {
        if (this.checkAbortSignal(signal, resolve)) {
          return;
        }
        this.log('error', 'Failed to fetch posts');
        this.log('warn', 'End with error');
        this.emit('end', { aborted: false, error: requestAPIError, message: 'API request error' });
        resolve();
        return;
      }

      const postsParser = new PostParser(this.logger);
      const collections = [ postsParser.parsePostsAPIResponse(json, postsAPIURL) ];
      const total = collections[0].total;
      if (this.#isFetchingMultiplePosts(postFetch)) {
        let totalFetched = collections[0].posts.length;
        let nextURL = collections[0].nextURL;
        while (nextURL) {
          this.log('debug', `Request more posts from API URL "${nextURL}"`);
          const { json } = await this.commonFetchAPI(nextURL, signal);
          if (!json) {
            if (this.checkAbortSignal(signal, resolve)) {
              return;
            }
            nextURL = null;
          }
          else {
            const collection = postsParser.parsePostsAPIResponse(json, nextURL);
            collections.push(collection);
            const fetched = collection.posts.length;
            totalFetched += fetched;
            this.log('info', `Fetched posts: ${totalFetched} / ${total}`);
            nextURL = collection.nextURL;
          }
        }
        if (total && totalFetched < total) {
          this.log('warn', `Some posts were not fetched - total expected: ${total}; currently fetched: ${totalFetched}`);
        }
        else {
          this.log('info', `${totalFetched} posts fetched`);
        }
      }

      // Step 2: download posts in each fetched collection
      let downloaded = 0;
      let skippedUnviewable = 0;
      let skippedRedundant = 0;
      let skippedUnmetMediaTypeCriteria = 0;
      let skippedNotInTier = 0;
      let campaignSaved = false;
      for (const collection of collections) {
        if (!campaignSaved && collection.posts[0]?.campaign) {
          await this.saveCampaignInfo(collection.posts[0].campaign, signal);
          campaignSaved = true;
          if (this.checkAbortSignal(signal, resolve)) {
            return;
          }
        }

        for (const _post of collection.posts) {

          let post = _post;

          if (this.#isFetchingMultiplePosts(postFetch)) {
            // Refresh to ensure media links have not expired
            this.log('debug', `Refresh post #${_post.id}`);
            const postURL = URLHelper.constructPostsAPIURL({ postId: _post.id });
            const { json } = await this.commonFetchAPI(postURL, signal);
            let refreshed: Post | null = null;
            if (json) {
              refreshed = postsParser.parsePostsAPIResponse(json, postURL).posts[0] || null;
              if (!refreshed) {
                this.log('warn', `Refreshed post #${_post.id} but got empty value - going to use existing data`);
              }
              else if (refreshed.id !== _post.id) {
                this.log('warn', `Refreshed post #${_post.id} but ID mismatch - going to use existing data`);
                refreshed = null;
              }
            }
            else if (this.checkAbortSignal(signal, resolve)) {
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
          const postDirs = FSHelper.getPostDirs(post, this.config);
          this.log('debug', 'Post directories:', postDirs);

          // Step 4.2: Check with status cache
          const statusCache = StatusCache.getInstance(postDirs.statusCache, this.logger, this.config.useStatusCache);
          if (statusCache.validate(post, postDirs.root, this.config)) {
            this.log('info', `Skipped downloading post #${post.id}: already downloaded and nothing has changed since last download`);
            this.emit('targetEnd', {
              target: post,
              isSkipped: true,
              skipReason: TargetSkipReason.AlreadyDownloaded,
              skipMessage: 'Target already downloaded and nothing has changed since last download'
            });
            skippedRedundant++;
            continue;
          }

          this.log('info', `Download post #${post.id} (${post.title})`);

          // Step 4.3: Check whether we should download post
          // -- 4.3.1: Viewability
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
              skippedUnviewable++;
              continue;
            }
          }

          // -- 4.3.2: Config option 'include.postsWithMediaType'
          const postsWithMediaType = this.config.include.postsWithMediaType;
          if (postsWithMediaType !== 'any') {
            const hasAttachments = post.attachments.length > 0;
            const hasAudio = !!post.audio || !!post.audioPreview;
            const hasImages = post.images.length > 0;
            const hasVideo = !!post.video || !!post.videoPreview || !!(post.embed && post.embed.type === 'videoEmbed');

            let skip = false;
            if (postsWithMediaType === 'none') {
              skip = hasAttachments || hasAudio || hasImages || hasVideo;
            }
            else if (Array.isArray(postsWithMediaType)) {
              skip = !(
                (postsWithMediaType.includes('attachment') && hasAttachments) ||
                (postsWithMediaType.includes('audio') && hasAudio) ||
                (postsWithMediaType.includes('image') && hasImages) ||
                (postsWithMediaType.includes('video') && hasVideo));
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
              skippedUnmetMediaTypeCriteria++;
              continue;
            }
          }

          // -- 4.3.3: Config option 'include.postsInTier'
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
              skippedNotInTier++;
              continue;
            }
            if (post.campaign) {
              this.log('debug', 'Match criteria OK:', `config.include.postsInTier: ${JSON.stringify(applicableTierIds)} <-> post #${post.id}:`, post.tiers);
            }
          }

          // Step 4.4: Save post info
          if (this.config.include.contentInfo) {
            this.log('info', `Save post info #${post.id}`);
            this.emit('phaseBegin', { target: post, phase: 'saveInfo' });
            FSHelper.createDir(postDirs.info);
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

            if (this.checkAbortSignal(signal, resolve)) {
              return;
            }

            // Save summary and raw json
            const summary = generatePostSummary(post);
            const summaryFile = path.resolve(postDirs.info, 'info.txt');
            const saveSummaryResult = await FSHelper.writeTextFile(summaryFile, summary, this.config.fileExistsAction.info);
            this.logWriteTextFileResult(saveSummaryResult, post, 'post summary');

            const postRawFile = path.resolve(postDirs.info, 'post-api.json');
            const savePostRawResult = await FSHelper.writeTextFile(
              postRawFile, fetchedPostAPIData || post.raw, this.config.fileExistsAction.infoAPI);
            this.logWriteTextFileResult(savePostRawResult, post, 'post API data');
            this.emit('phaseEnd', { target: post, phase: 'saveInfo' });

            // (Downloading of info media items deferred to the next step)
          }

          if (this.config.include.previewMedia || this.config.include.contentMedia) {
            this.emit('phaseBegin', { target: post, phase: 'saveMedia' });
          }

          // Step 4.5: save embed info
          if (post.embed && this.config.include.contentMedia) {
            this.log('info', `Save embed info of post #${post.id}`);
            FSHelper.createDir(postDirs.embed);
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
            const saveSummaryResult = await FSHelper.writeTextFile(embedFile, embedSummary, this.config.fileExistsAction.content);
            this.logWriteTextFileResult(saveSummaryResult, post, 'embed info');
          }

          // Step 4.6: create download tasks
          if (this.config.include.previewMedia ||
            this.config.include.contentMedia ||
            this.config.include.contentInfo) {

            batch = this.#createDownloadTaskBatchForPost(post, postDirs);

            if (this.config.include.contentInfo) {
              const infoElements: Downloadable[] = [];
              if (post.coverImage) {
                infoElements.push(post.coverImage);
              }
              if (post.thumbnail) {
                infoElements.push(post.thumbnail);
              }
              if (infoElements.length > 0) {
                this.addToDownloadTaskBatch(batch,
                  {
                    target: infoElements,
                    targetName: `post #${post.id} -> info elements`,
                    destDir: postDirs.info,
                    fileExistsAction: this.config.fileExistsAction.info
                  }
                );
              }
            }

            this.log('info', `Download batch created (#${batch.id}): ${batch.getTasks('pending').length} downloads pending`);
            this.emit('phaseBegin', { target: post, phase: 'batchDownload', batch });

            await batch.start();

            // Step 4.7: Update status cache
            statusCache.updateOnDownload(post, postDirs.root, batch.getTasks('error').length > 0, this.config);

            await batch.destroy();
            batch = null;
            this.emit('phaseEnd', { target: post, phase: 'batchDownload'});
          }

          if (this.config.include.previewMedia || this.config.include.contentMedia) {
            this.emit('phaseEnd', { target: post, phase: 'saveMedia' });
          }

          downloaded++;
          this.emit('targetEnd', { target: post, isSkipped: false });

          if (this.checkAbortSignal(signal, resolve)) {
            return;
          }
        }
      }

      if (this.checkAbortSignal(signal, resolve)) {
        return;
      }

      // Done
      if (signal) {
        signal.removeEventListener('abort', abortHandler);
      }
      if (postFetch.type === 'byUser') {
        this.log('info', `Done downloading posts by '${postFetch.vanity}'`);
      }
      else if (postFetch.type === 'byUserId') {
        this.log('info', `Done downloading posts by user #${postFetch.userId}`);
      }
      else if (postFetch.type === 'byCollection') {
        this.log('info', `Done downloading posts in collection #${postFetch.collectionId}`);
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
        const skippedStr = skippedStrParts.length > 0 ? ` (skipped: ${skippedStrParts.join(', ')})` : '';
        endMessage = `Total ${downloaded} / ${total} posts processed${skippedStr}`;
        this.log('info', endMessage);
      }
      this.emit('end', { aborted: false, message: endMessage });
      this.#startPromise = null;
      resolve();
    })
      .finally(async () => {
        if (this.logger) {
          await this.logger.end();
        }
        this.#startPromise = null;
      });

    return this.#startPromise;
  }

  #isFetchingMultiplePosts(postFetch: DownloaderConfig<Post>['postFetch']): postFetch is DownloaderConfig<Post>['postFetch'] & { type: 'byUser' | 'byUserId' | 'byCollection' } {
    return postFetch.type === 'byUser' || postFetch.type === 'byUserId' || postFetch.type === 'byCollection';
  }

  async #getInitialPostsAPIUL(signal: AbortSignal | undefined, resolveOnAbort: () => void, resolveOnError: () => void) {
    const postFetch = this.config.postFetch;
    if (this.#isFetchingMultiplePosts(postFetch)) {
      const pageURL = this.#getInitialDataPageURL();
      const { campaignId, currentUserId } = await this.#getInitialData(pageURL, signal, resolveOnAbort, resolveOnError);
      let sort: PostSortOrder | undefined;
      if (postFetch.type === 'byCollection') {
        sort = PostSortOrder.CollectionOrder;
      }

      return URLHelper.constructPostsAPIURL({
        campaignId,
        currentUserId: this.config.include.lockedContent ? undefined : currentUserId,
        filters: postFetch.filters,
        sort
      });
    }

    return URLHelper.constructPostsAPIURL({ postId: postFetch.postId });
  }

  #getInitialDataPageURL() {
    const postFetch = this.config.postFetch;
    switch (postFetch.type) {
      case 'byUser':
        return URLHelper.constructCampaignPageURL({ vanity: postFetch.vanity });
      case 'byUserId':
        return URLHelper.constructCampaignPageURL({ userId: postFetch.userId });
      case 'byCollection':
        return URLHelper.constructCollectionURL(postFetch.collectionId);
      default:
        throw Error(`postFetch type mismatch: expecting 'byUser', 'byUserId' or 'byCollection' but got '${postFetch.type}'`);
    }
  }

  async #getInitialData(url: string, signal: AbortSignal | undefined, resolveOnAbort?: () => void, resolveOnError?: () => void) {
    this.log('debug', `Fetch initial data from "${url}"`);
    let page, requestPageError;
    try {
      page = await this.fetcher.get({ url, type: 'html', maxRetries: this.config.request.maxRetries, signal });
    }
    catch (error) {
      if (error instanceof AbortError) {
        this.log('warn', 'Page request aborted');
      }
      else {
        requestPageError = error;
      }
      page = null;
    }
    if (!page) {
      if (resolveOnAbort && this.checkAbortSignal(signal, resolveOnAbort)) {
        throw Error();
      }
      this.log('error', `Error requesting page "${url}": `, requestPageError);
      this.emit('end', { aborted: false, error: requestPageError, message: 'Request error' });
      if (resolveOnError) {
        resolveOnError();
      }
      throw Error();
    }
    const pageParser = new PageParser(this.logger);
    let initialData, parseInitialDataError;
    try {
      initialData = pageParser.parseInitialData(page, url);
    }
    catch (error) {
      parseInitialDataError = error;
      initialData = null;
    }
    if (!initialData) {
      this.log('error', `Failed to obtain initial page data from "${url}":`, parseInitialDataError);
      this.emit('end', { aborted: false, error: parseInitialDataError, message: 'Parse error' });
      if (resolveOnError) {
        resolveOnError();
      }
      throw Error();
    }
    const campaignId = ObjectHelper.getProperty(initialData, 'pageBootstrap.campaign.data.id');
    const currentUserId = ObjectHelper.getProperty(initialData, 'commonBootstrap.currentUser.data.id');
    this.log('debug', `Initial data: campaign ID '${campaignId}'; current user ID '${currentUserId}'`);
    if (!campaignId) {
      const err = Error(`Campaign ID not found in initial data of "${url}"`);
      this.log('error', err);
      this.emit('end', { aborted: false, error: err, message: 'Data error (campaign ID not found)' });
      if (resolveOnError) {
        resolveOnError();
      }
      throw Error();
    }

    return { campaignId, currentUserId };
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
    const { campaignId } = await this.#getInitialData(url, signal);
    const postsParser = new PostParser(this.logger);
    const res = await this.fetchCampaign(campaignId);
    if (signal?.aborted) {
      throw new AbortError();
    }
    if (res.error) {
      throw res.error;
    }
    return postsParser.parseCampaignAPIResponse(res.json);
  }

  #createDownloadTaskBatchForPost(post: Post, postDirs: ReturnType<typeof FSHelper['getPostDirs']>) {

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

    const batch = this.createDownloadTaskBatch(
      `Post #${post.id} (${post.title})`,

      __incPreview('audio') && post.audioPreview ? {
        target: [ post.audioPreview ],
        targetName: `post #${post.id} -> audio preview`,
        destDir: postDirs.audioPreview,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incPreview('video') && post.videoPreview ? {
        target: [ post.videoPreview ],
        targetName: `post #${post.id} -> video preview`,
        destDir: postDirs.videoPreview,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      /**
       * If post is not viewable by current user, its images will be
       * blurry and we should categorize them as image previews.
       */
      __incPreview('image') && post.images.length > 0 && !post.isViewable ? {
        target: post.images,
        targetName: `post #${post.id} -> image previews`,
        destDir: postDirs.imagePreviews,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('audio') && post.audio ? {
        target: [ post.audio ],
        targetName: `post #${post.id} -> audio`,
        destDir: postDirs.audio,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('video') && post.video ? {
        target: [ post.video ],
        targetName: `post #${post.id} -> video`,
        destDir: postDirs.video,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('image') && post.images.length > 0 && post.isViewable ? {
        target: post.images,
        targetName: `post #${post.id} -> images`,
        destDir: postDirs.images,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('attachment') && post.attachments.length > 0 ? {
        target: post.attachments,
        targetName: `post #${post.id} -> attachments`,
        destDir: postDirs.attachments,
        fileExistsAction: this.config.fileExistsAction.content
      } : null,

      __incContent('video') && post.embed &&
        (isYouTubeEmbed(post.embed) || DownloadTaskFactory.findEmbedDownloader(this.config.embedDownloaders, post.embed.provider)) ?
        {
          target: [ post.embed ],
          targetName: `post #${post.id} -> embedded ${post.embed.provider} video`,
          destDir: postDirs.embed,
          fileExistsAction: this.config.fileExistsAction.content
        } : null
    );

    return batch;
  }
}
