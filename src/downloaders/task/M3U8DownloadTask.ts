import { type VideoMediaItem } from '../../entities/MediaItem.js';
import { SITE_URL } from '../../utils/URLHelper.js';
import FFmpegDownloadTaskBase, { type FFmpegCommandParams, type FFmpegDownloadTaskBaseParams } from './FFmpegDownloadTaskBase.js';
import semver from 'semver';
import m3u8Parser, { type PlaylistItem } from 'm3u8-parser';
import type Fetcher from '../../utils/Fetcher.js';
import FSHelper from '../../utils/FSHelper.js';
import path from 'path';

interface Variant extends PlaylistItem {
  protected?: boolean;
}

type PickVariantResult = {
  src: null;
  reason: string;
} | {
  src: string;
  resolution: string | null,
  protected?: boolean;
};

export interface M3U8DownloadTaskParams extends FFmpegDownloadTaskBaseParams<VideoMediaItem> {
  fetcher: Fetcher;
  destFilePath: string;
}

interface M3U8FFmpegCommandParams extends FFmpegCommandParams {
  inputs: (FFmpegCommandParams['inputs'][number] & { resolution: string | null })[];
};

export default class M3U8DownloadTask extends FFmpegDownloadTaskBase<VideoMediaItem> {

  name = 'M3U8DownloadTask';

  #skipOnStart: {
    reason: string;
  } | null;
  #fetcher: Fetcher;
  #unresolvedDestFilePath: string;
  #ffmpegCommandParams: M3U8FFmpegCommandParams | null;

  constructor(params: M3U8DownloadTaskParams) {
    super(params);
    this.#fetcher = params.fetcher;
    this.#unresolvedDestFilePath = params.destFilePath;
    this.#ffmpegCommandParams = null;
    this.#skipOnStart = null;
  }

  async start() {
    if (this.#skipOnStart) {
      return this.notifySkip({
        name: 'other',
        message: this.#skipOnStart.reason,
      });
    }
    return await super.start();
  }

  protected async resolveDestPath(signal?: AbortSignal) {
    const params = await this.getFFmpegCommandParams(signal);
    return params.output;
  }

  protected async getFFmpegCommandParams(signal?: AbortSignal): Promise<M3U8FFmpegCommandParams> {
    if (this.#ffmpegCommandParams) {
      return this.#ffmpegCommandParams;
    }

    const input = await this.#pickVariant(signal);
    if (input.src === null) {
      this.#skipOnStart = {
        reason: `No downloadable source - ${input.reason}`
      };
    }

    const inputOptions = [
      '-protocol_whitelist',
      'http,https,tcp,tls',
      '-headers',
      `Referer: ${SITE_URL}`
    ];
    let output = this.#unresolvedDestFilePath;
    if (input.src) {
      if (input.protected || input.resolution) {
        const parsedFilePath = path.parse(this.#unresolvedDestFilePath);
        const { ext, dir } = parsedFilePath;
        let filename = parsedFilePath.name;
        if (input.resolution) {
          filename += ` (${input.resolution})`;
        }
        if (input.protected) {
          filename += ' drm';
        }
        output = path.resolve(dir, FSHelper.sanitizeFilename(`${filename}${ext}`));
      }

      const criteria = JSON.stringify({
        'max video resolution': this.config.maxVideoResolution || undefined,
        'include protected media':  this.config.include.protectedMedia ? 'yes' : undefined
      });
      const criteriaStr  = criteria === '{}' ? '' : ` matching criteria ${JSON.stringify(criteria)}`;
      const streamInfoParts = [
        input.resolution || 'unknown resolution',
        input.protected === true ? 'protected'
          : input.protected === false ? ''
          : 'unknown'
      ];
      this.log('info', `Target stream${criteriaStr}:`, streamInfoParts.join(';'));
    }

    this.#ffmpegCommandParams = {
      inputs: [
        {
          input: input.src || this.src,
          options: inputOptions,
          resolution: input.src ? input.resolution : null
        }
      ],
      output
    };

    return this.#ffmpegCommandParams;
  }

  protected getTargetDuration(): number | null {
    return this.srcEntity.duration;
  }

  async #pickVariant(signal?: AbortSignal): Promise<PickVariantResult> {
    const { contents: m3u8 } = await this.#fetcher.get({
      url: this.src,
      type: 'm3u8',
      maxRetries: this.config.request.maxRetries,
      signal
    });
    const parser = new m3u8Parser.Parser();
    parser.push(m3u8);
    parser.end();

    if (!parser.manifest.playlists || parser.manifest.playlists.length === 0) {
      this.log('warn', `No stream found in m3u8 manifest - going to download without stream selection`);
      return {
        src: this.src,
        resolution: 'best quality',
        protected: undefined
      };
    }

    const orderedPlaylistItems = parser.manifest.playlists
      .sort((a, b) => {
        // 1. Get heights or 0
        const heightA = a.attributes.RESOLUTION?.height || 0;
        const heightB = b.attributes.RESOLUTION?.height || 0;

        // 2. If heights are different, sort by height
        if (heightB !== heightA) {
          return heightB - heightA;
        }

        // 3. If heights are the same (or both 0), sort by BANDWIDTH
        const bandwidthA = a.attributes.BANDWIDTH || 0;
        const bandwidthB = b.attributes.BANDWIDTH || 0;

        return bandwidthB - bandwidthA;
      });
    let variants = await this.#getProtectionStatus(orderedPlaylistItems, signal);
    
    if (variants.every((v) => v.protected === false) && !this.config.maxVideoResolution) {
      return {
        src: this.src,
        resolution: 'best quality',
        protected: false
      };
    }

    this.log('debug', `m3u8 has ${variants?.length ?? 0} variants (src: ${this.src})`);
  
    // include.protectedMedia
    if (!this.config.include.protectedMedia) {
      const prevLength = variants.length;
      variants = variants.filter((v) => !v.protected)
      if (variants.length === 0) {
        this.log('debug', 'All streams are protected');
        return {
          src: null,
          reason: 'Media is protected'
        };
      }
      else {
        this.log('debug', `${(prevLength - variants.length) / prevLength} streams are protected`)
      }
    }

    // maxVideoResolution
    const maxResolution = this.config.maxVideoResolution;
    const hasMaxResolutionConfigured = maxResolution && maxResolution > 0;
   
    const __hasAudio = (variant: typeof variants[number]) => {
      const codecs = variant.attributes.CODECS || "";
      return codecs.includes("mp4a"); // crude check for AAC audio
    }

    const allWithoutAudio = variants.every((v) => !__hasAudio(v));

    if (hasMaxResolutionConfigured) {
      this.log('debug', `Apply maxVideoResolution "${maxResolution}"`);
      const maxResCandidates = variants
        .filter((v) => (v.attributes.RESOLUTION && v.attributes.RESOLUTION.height <= maxResolution) && (allWithoutAudio || __hasAudio(v)));
      if (maxResCandidates.length === 0 ) {
        this.log('debug', `No stream in m3u8 manifest has resolution "${maxResolution}" or lower - maxVideoResolution not applied`);
      }
      else {
        variants = maxResCandidates;
      }
    }

    const selected = variants[0];

    return {
      src: new URL(selected.uri, this.src).href,
      resolution: this.#getResolutionString(selected),
      protected: selected.protected
    };
  }

  async #getProtectionStatus(variants: PlaylistItem[], signal?: AbortSignal): Promise<Variant[]> {
    return await Promise.all(variants.map((variant) =>
      this.#fetcher.get({
        url: variant.uri,
        type: 'm3u8',
        maxRetries: this.config.request.maxRetries,
        signal
      })
      .then(({contents: m3u8}) => {
        const parser = new m3u8Parser.Parser();
        parser.push(m3u8);
        parser.end();
        const protectionData = parser.manifest.contentProtection;
        const _protected = !!(protectionData && typeof protectionData === 'object' && Object.entries(protectionData).length > 0);
        return {
          ...variant,
          protected: _protected
        };
      })
      .catch((error: unknown) => {
        if (signal?.aborted) {
          throw error;
        }
        this.log('warn', `Could not determine if stream (${this.#getResolutionString(variant)}) is protected:`, error);
        return {
          ...variant,
          protected: undefined
        };
      })
    ));
  }

  #getResolutionString(item: PlaylistItem) {
    if (item.attributes.RESOLUTION?.width && item.attributes.RESOLUTION?.height) {
      return `${item.attributes.RESOLUTION.width}x${item.attributes.RESOLUTION.height}`;
    }
    return null;
  }
}
