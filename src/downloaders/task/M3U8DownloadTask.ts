import { type VideoMediaItem } from '../../entities/MediaItem.js';
import { SITE_URL } from '../../utils/URLHelper.js';
import FFmpegDownloadTaskBase, { type FFmpegCommandParams, type FFmpegDownloadTaskBaseParams } from './FFmpegDownloadTaskBase.js';
import semver from 'semver';
import m3u8Parser from 'm3u8-parser';
import type Fetcher from '../../utils/Fetcher.js';
import FSHelper from '../../utils/FSHelper.js';
import path from 'path';

export interface M3U8DownloadTaskParams extends FFmpegDownloadTaskBaseParams<VideoMediaItem> {
  fetcher: Fetcher;
  destFilePath: string;
}

interface M3U8FFmpegCommandParams extends FFmpegCommandParams {
  inputs: (FFmpegCommandParams['inputs'][number] & { resolution: string | null })[];
};

export default class M3U8DownloadTask extends FFmpegDownloadTaskBase<VideoMediaItem> {

  name = 'M3U8DownloadTask';

  #fetcher: Fetcher;
  #unresolvedDestFilePath: string;
  #ffmpegCommandParams: M3U8FFmpegCommandParams | null;

  constructor(params: M3U8DownloadTaskParams) {
    super(params);
    this.#fetcher = params.fetcher;
    this.#unresolvedDestFilePath = params.destFilePath;
    this.#ffmpegCommandParams = null;
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
    const inputOptions = [
      '-protocol_whitelist',
      'http,https,tcp,tls',
      '-headers',
      `Referer: ${SITE_URL}`
    ];
    // `extension_picky` introduced in v7.1.1
    if (semver.satisfies(this.getFFmpegVersion(), '>=7.1.1')) {
      inputOptions.push('-extension_picky', '0');
    }
    let output = this.#unresolvedDestFilePath;
    if (this.config.maxVideoResolution && this.config.maxVideoResolution > 0) {
      if (input.resolution) {
        this.log('info', `Video found with resolution at or below specified max resolution "${this.config.maxVideoResolution}": ${input.resolution}`);
        const { name: filename, ext, dir } = path.parse(this.#unresolvedDestFilePath);
        output = path.resolve(dir, FSHelper.sanitizeFilename(`${filename} (${input.resolution})${ext}`));
      }
      else {
        this.log('info', `No video found with resolution at or below specified max resolution "${this.config.maxVideoResolution}" - going to download highest`);
      }
    }

    this.#ffmpegCommandParams = {
      inputs: [
        {
          input: input.src,
          options: inputOptions,
          resolution: input.resolution
        }
      ],
      output
    };

    return this.#ffmpegCommandParams;
  }

  protected getTargetDuration(): number | null {
    return this.srcEntity.duration;
  }

  async #pickVariant(signal?: AbortSignal) {
    const maxResolution = this.config.maxVideoResolution;
    if (!maxResolution || maxResolution < 0) {
      return {
        src: this.src,
        resolution: null
      };
    }

    this.log('debug', `Apply maxVideoResolution "${maxResolution}"`);

    const { html: m3u8 } = await this.#fetcher.get({
      url: this.src,
      type: 'html',
      maxRetries: this.config.request.maxRetries,
      signal
    });
    const parser = new m3u8Parser.Parser();
    parser.push(m3u8);
    parser.end();

    const variants = parser.manifest.playlists;

    this.log('debug', `m3u8 has ${variants?.length ?? 0} variants (src: ${this.src})`);
    
    if (!variants) {
      this.log('debug', `No videos found in m3u8 manifest - going to download video with highest resolution`);
      return {
        src: this.src,
        resolution: null
      };
    }
    
    const __hasAudio = (variant: typeof variants[number]) => {
      const codecs = variant.attributes.CODECS || "";
      return codecs.includes("mp4a"); // crude check for AAC audio
    }

    const allWithoutAudio = variants.every((v) => !__hasAudio(v));

    const filtered = variants
      .filter((v) => (v.attributes.RESOLUTION && v.attributes.RESOLUTION.height <= maxResolution) && (allWithoutAudio || __hasAudio(v)))
      .sort((a, b) => b.attributes.RESOLUTION!.height - a.attributes.RESOLUTION!.height);

    if (filtered.length === 0) {
      this.log('debug', `No video found in m3u8 manifest at or below resolution "${maxResolution}" - going to download video with highest resolution`);
      return {
        src: this.src,
        resolution: null
      };
    }

    const selected = filtered[0];

    this.log('debug', `Video at or below resolution "${maxResolution}": ${selected.uri} (${JSON.stringify(selected.attributes.RESOLUTION)})`);

    return {
      src: new URL(selected.uri, this.src).href,
      resolution: `${selected.attributes.RESOLUTION!.width}x${selected.attributes.RESOLUTION!.height}`
    };
  }
}
