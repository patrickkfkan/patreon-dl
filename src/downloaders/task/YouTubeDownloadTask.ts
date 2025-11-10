import path from 'path';
import * as InnertubeLib from 'youtubei.js';
import { type YT, type Misc } from 'youtubei.js';
import { type YouTubePostEmbed } from '../../entities/Post.js';
import FFmpegDownloadTaskBase, { type FFmpegCommandParams, type FFmpegDownloadTaskBaseParams } from './FFmpegDownloadTaskBase.js';
import InnertubeLoader from '../../utils/yt/InnertubeLoader.js';
import FSHelper from '../../utils/FSHelper.js';
import fs from 'fs';
import DownloadTask from './DownloadTask.js';
import YouTubeStreamDownloadTask from './YouTubeStreamDownloadTask.js';
import { type FileExistsAction } from '../DownloaderOptions.js';
import type Fetcher from '../../utils/Fetcher.js';
import { fetch } from 'undici';

export interface YouTubeDownloadTaskParams extends FFmpegDownloadTaskBaseParams<YouTubePostEmbed> {
  destDir: string;
  fetcher: Fetcher;
}

interface ItagFormat {
  ext: string;
  width?: number;
  height?: number;
  acodec?: string;
  abr?: number;
  vcodec?: string;
  format_note?: string;
  preference?: number;
  container?: string;
  fps?: number;
}

// Taken from yt-dlp:
// https://github.com/yt-dlp/yt-dlp/blob/349f36606fa7fb658216334a73ac7825c13503c2/yt_dlp/extractor/youtube/_video.py#L138
const ITAG_FORMATS: Record<number, ItagFormat> = {
  // NB: Used in YoutubeWebArchiveIE and GoogleDriveIE
  5: { 'ext': 'flv', 'width': 400, 'height': 240, 'acodec': 'mp3', 'abr': 64, 'vcodec': 'h263' },
  6: { 'ext': 'flv', 'width': 450, 'height': 270, 'acodec': 'mp3', 'abr': 64, 'vcodec': 'h263' },
  13: { 'ext': '3gp', 'acodec': 'aac', 'vcodec': 'mp4v' },
  17: { 'ext': '3gp', 'width': 176, 'height': 144, 'acodec': 'aac', 'abr': 24, 'vcodec': 'mp4v' },
  18: { 'ext': 'mp4', 'width': 640, 'height': 360, 'acodec': 'aac', 'abr': 96, 'vcodec': 'h264' },
  22: { 'ext': 'mp4', 'width': 1280, 'height': 720, 'acodec': 'aac', 'abr': 192, 'vcodec': 'h264' },
  34: { 'ext': 'flv', 'width': 640, 'height': 360, 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264' },
  35: { 'ext': 'flv', 'width': 854, 'height': 480, 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264' },

  // itag 36 videos are either 320x180 (BaW_jenozKc) or 320x240 (__2ABJjxzNo), abr varies as well
  36: { 'ext': '3gp', 'width': 320, 'acodec': 'aac', 'vcodec': 'mp4v' },
  37: { 'ext': 'mp4', 'width': 1920, 'height': 1080, 'acodec': 'aac', 'abr': 192, 'vcodec': 'h264' },
  38: { 'ext': 'mp4', 'width': 4096, 'height': 3072, 'acodec': 'aac', 'abr': 192, 'vcodec': 'h264' },
  43: { 'ext': 'webm', 'width': 640, 'height': 360, 'acodec': 'vorbis', 'abr': 128, 'vcodec': 'vp8' },
  44: { 'ext': 'webm', 'width': 854, 'height': 480, 'acodec': 'vorbis', 'abr': 128, 'vcodec': 'vp8' },
  45: { 'ext': 'webm', 'width': 1280, 'height': 720, 'acodec': 'vorbis', 'abr': 192, 'vcodec': 'vp8' },
  46: { 'ext': 'webm', 'width': 1920, 'height': 1080, 'acodec': 'vorbis', 'abr': 192, 'vcodec': 'vp8' },
  59: { 'ext': 'mp4', 'width': 854, 'height': 480, 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264' },
  78: { 'ext': 'mp4', 'width': 854, 'height': 480, 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264' },

  // 3D videos
  82: { 'ext': 'mp4', 'height': 360, 'format_note': '3D', 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264', 'preference': -20 },
  83: { 'ext': 'mp4', 'height': 480, 'format_note': '3D', 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264', 'preference': -20 },
  84: { 'ext': 'mp4', 'height': 720, 'format_note': '3D', 'acodec': 'aac', 'abr': 192, 'vcodec': 'h264', 'preference': -20 },
  85: { 'ext': 'mp4', 'height': 1080, 'format_note': '3D', 'acodec': 'aac', 'abr': 192, 'vcodec': 'h264', 'preference': -20 },
  100: { 'ext': 'webm', 'height': 360, 'format_note': '3D', 'acodec': 'vorbis', 'abr': 128, 'vcodec': 'vp8', 'preference': -20 },
  101: { 'ext': 'webm', 'height': 480, 'format_note': '3D', 'acodec': 'vorbis', 'abr': 192, 'vcodec': 'vp8', 'preference': -20 },
  102: { 'ext': 'webm', 'height': 720, 'format_note': '3D', 'acodec': 'vorbis', 'abr': 192, 'vcodec': 'vp8', 'preference': -20 },

  // Apple HTTP Live Streaming
  91: { 'ext': 'mp4', 'height': 144, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 48, 'vcodec': 'h264', 'preference': -10 },
  92: { 'ext': 'mp4', 'height': 240, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 48, 'vcodec': 'h264', 'preference': -10 },
  93: { 'ext': 'mp4', 'height': 360, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264', 'preference': -10 },
  94: { 'ext': 'mp4', 'height': 480, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 128, 'vcodec': 'h264', 'preference': -10 },
  95: { 'ext': 'mp4', 'height': 720, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 256, 'vcodec': 'h264', 'preference': -10 },
  96: { 'ext': 'mp4', 'height': 1080, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 256, 'vcodec': 'h264', 'preference': -10 },
  132: { 'ext': 'mp4', 'height': 240, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 48, 'vcodec': 'h264', 'preference': -10 },
  151: { 'ext': 'mp4', 'height': 72, 'format_note': 'HLS', 'acodec': 'aac', 'abr': 24, 'vcodec': 'h264', 'preference': -10 },

  // DASH mp4 video
  133: { 'ext': 'mp4', 'height': 240, 'format_note': 'DASH video', 'vcodec': 'h264' },
  134: { 'ext': 'mp4', 'height': 360, 'format_note': 'DASH video', 'vcodec': 'h264' },
  135: { 'ext': 'mp4', 'height': 480, 'format_note': 'DASH video', 'vcodec': 'h264' },
  136: { 'ext': 'mp4', 'height': 720, 'format_note': 'DASH video', 'vcodec': 'h264' },
  137: { 'ext': 'mp4', 'height': 1080, 'format_note': 'DASH video', 'vcodec': 'h264' },
  138: { 'ext': 'mp4', 'format_note': 'DASH video', 'vcodec': 'h264' }, // Height can vary (https://github.com/ytdl-org/youtube-dl/issues/4559)
  160: { 'ext': 'mp4', 'height': 144, 'format_note': 'DASH video', 'vcodec': 'h264' },
  212: { 'ext': 'mp4', 'height': 480, 'format_note': 'DASH video', 'vcodec': 'h264' },
  264: { 'ext': 'mp4', 'height': 1440, 'format_note': 'DASH video', 'vcodec': 'h264' },
  298: { 'ext': 'mp4', 'height': 720, 'format_note': 'DASH video', 'vcodec': 'h264', 'fps': 60 },
  299: { 'ext': 'mp4', 'height': 1080, 'format_note': 'DASH video', 'vcodec': 'h264', 'fps': 60 },
  266: { 'ext': 'mp4', 'height': 2160, 'format_note': 'DASH video', 'vcodec': 'h264' },

  // Dash mp4 audio
  139: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'abr': 48, 'container': 'm4a_dash' },
  140: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'abr': 128, 'container': 'm4a_dash' },
  141: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'abr': 256, 'container': 'm4a_dash' },
  256: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'container': 'm4a_dash' },
  258: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'aac', 'container': 'm4a_dash' },
  325: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'dtse', 'container': 'm4a_dash' },
  328: { 'ext': 'm4a', 'format_note': 'DASH audio', 'acodec': 'ec-3', 'container': 'm4a_dash' },

  // Dash webm
  167: { 'ext': 'webm', 'height': 360, 'width': 640, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp8' },
  168: { 'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp8' },
  169: { 'ext': 'webm', 'height': 720, 'width': 1280, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp8' },
  170: { 'ext': 'webm', 'height': 1080, 'width': 1920, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp8' },
  218: { 'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp8' },
  219: { 'ext': 'webm', 'height': 480, 'width': 854, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp8' },
  278: { 'ext': 'webm', 'height': 144, 'format_note': 'DASH video', 'container': 'webm', 'vcodec': 'vp9' },
  242: { 'ext': 'webm', 'height': 240, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  243: { 'ext': 'webm', 'height': 360, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  244: { 'ext': 'webm', 'height': 480, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  245: { 'ext': 'webm', 'height': 480, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  246: { 'ext': 'webm', 'height': 480, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  247: { 'ext': 'webm', 'height': 720, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  248: { 'ext': 'webm', 'height': 1080, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  271: { 'ext': 'webm', 'height': 1440, 'format_note': 'DASH video', 'vcodec': 'vp9' },

  // itag 272 videos are either 3840x2160 (e.g. RtoitU2A-3E) or 7680x4320 (sLprVF6d7Ug)
  272: { 'ext': 'webm', 'height': 2160, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  302: { 'ext': 'webm', 'height': 720, 'format_note': 'DASH video', 'vcodec': 'vp9', 'fps': 60 },
  303: { 'ext': 'webm', 'height': 1080, 'format_note': 'DASH video', 'vcodec': 'vp9', 'fps': 60 },
  308: { 'ext': 'webm', 'height': 1440, 'format_note': 'DASH video', 'vcodec': 'vp9', 'fps': 60 },
  313: { 'ext': 'webm', 'height': 2160, 'format_note': 'DASH video', 'vcodec': 'vp9' },
  315: { 'ext': 'webm', 'height': 2160, 'format_note': 'DASH video', 'vcodec': 'vp9', 'fps': 60 },

  // Dash webm audio
  171: { 'ext': 'webm', 'acodec': 'vorbis', 'format_note': 'DASH audio', 'abr': 128 },
  172: { 'ext': 'webm', 'acodec': 'vorbis', 'format_note': 'DASH audio', 'abr': 256 },

  // Dash webm audio with opus inside
  249: { 'ext': 'webm', 'format_note': 'DASH audio', 'acodec': 'opus', 'abr': 50 },
  250: { 'ext': 'webm', 'format_note': 'DASH audio', 'acodec': 'opus', 'abr': 70 },
  251: { 'ext': 'webm', 'format_note': 'DASH audio', 'acodec': 'opus', 'abr': 160 },

  // RTMP (unnamed)
  //'_rtmp': {'protocol': 'rtmp'},

  // av01 video only formats sometimes served with "unknown" codecs
  394: { 'ext': 'mp4', 'height': 144, 'format_note': 'DASH video', 'vcodec': 'av01.0.00M.08' },
  395: { 'ext': 'mp4', 'height': 240, 'format_note': 'DASH video', 'vcodec': 'av01.0.00M.08' },
  396: { 'ext': 'mp4', 'height': 360, 'format_note': 'DASH video', 'vcodec': 'av01.0.01M.08' },
  397: { 'ext': 'mp4', 'height': 480, 'format_note': 'DASH video', 'vcodec': 'av01.0.04M.08' },
  398: { 'ext': 'mp4', 'height': 720, 'format_note': 'DASH video', 'vcodec': 'av01.0.05M.08' },
  399: { 'ext': 'mp4', 'height': 1080, 'format_note': 'DASH video', 'vcodec': 'av01.0.08M.08' },
  400: { 'ext': 'mp4', 'height': 1440, 'format_note': 'DASH video', 'vcodec': 'av01.0.12M.08' },
  401: { 'ext': 'mp4', 'height': 2160, 'format_note': 'DASH video', 'vcodec': 'av01.0.12M.08' },
}

type StreamType = 'video' | 'audio' | 'video+audio';

type Stream<T extends StreamType> = {
  type: T;
  url: string;
  quality: string;
  itag: number;
  contentLength?: number;
  cpn: string;
};

type StreamBundle = {
  type: 'separateAV';
  video: Stream<'video'>;
  audio: Stream<'audio'>;
} | {
  type: 'combinedAV';
  stream: Stream<'video+audio'>;
} | {
  type: 'videoOnly';
  stream: Stream<'video'>;
} | {
  type: 'audioOnly';
  stream: Stream<'audio'>;
};

interface YouTubeFFmpegCommandParams extends FFmpegCommandParams {
  inputs: (FFmpegCommandParams['inputs'][number] & { stream: Stream<any> })[];
};

export default class YouTubeDownloadTask extends FFmpegDownloadTaskBase<YouTubePostEmbed> {

  name = 'YouTubeDownloadTask';

  static #innertubeForResolveURL: InnertubeLib.Innertube | null = null;

  #destDir: string;
  #fileExistsAction: FileExistsAction;
  #video: YT.VideoInfo | null;
  #ffmpegCommandParams: YouTubeFFmpegCommandParams | null;
  #fetcher: Fetcher;

  constructor(params: YouTubeDownloadTaskParams) {
    super(params);
    this.#destDir = params.destDir;
    this.#fileExistsAction = params.fileExistsAction;
    this.#video = null;
    this.#ffmpegCommandParams = null;
    this.#fetcher = params.fetcher;
  }

  protected async resolveDestPath(signal?: AbortSignal) {
    const params = await this.getFFmpegCommandParams(signal);
    return params.output;
  }

  async getInnertube() {
    return (await InnertubeLoader.getInstance(this.config)).innertube;
  }

  async #getInfo(videoId: string) {
    return (await InnertubeLoader.getInstance(this.config)).getVideoInfo(videoId);
  }

  protected async doStart() {
    const innertube = await this.getInnertube();
    const ffmpegParams = await this.getFFmpegCommandParams();

    const destFilePath = ffmpegParams.output;
    if (this.#fileExistsAction === 'skip' && fs.existsSync(destFilePath)) {
      await this.setDownloaded(destFilePath);
      this.notifySkip({
        name: 'destFileExists',
        message: `Destination file exists (${destFilePath})`,
        existingDestFilePath: destFilePath
      });
      return;
    }

    const __checkStreamDownloads = (tasks: YouTubeStreamDownloadTask<any>[], resolve: (value: 'complete' | 'incomplete') => void) => {
      if (tasks.every((task) => task.hasEnded())) {
        resolve(tasks.every((task) => task.status === 'completed') ? 'complete' : 'incomplete');
      }
    }

    const streamDownloadsResult = await new Promise<'complete' | 'incomplete'>((resolve) => {
      void (async () => {
        const tasks = await Promise.all(ffmpegParams.inputs.map(({ input, stream }) =>
          DownloadTask.create(YouTubeStreamDownloadTask, {
            downloadType: 'main',
            callbacks: this.callbacks,
            config: this.config,
            logger: this.logger,
            src: this.src,
            srcEntity: this.srcEntity,
            innertube,
            stream,
            destFilePath: input,
            callback: () => __checkStreamDownloads(tasks, resolve)
          })
        ));
        for (const task of tasks) {
          this.callbacks?.onSpawn(this, task);
        }
      })();
    });

    try {
      if (streamDownloadsResult === 'complete')  {
        if (this.config.dryRun) {
          this.log('debug', 'YouTube stream(s) downloaded');
          this.log('debug', '(dry-run) -> Skip FFmpeg processing on downloaded stream(s)');
          this.notifyComplete();
        }
        else {
          this.log('debug', 'YouTube stream(s) downloaded - going to run FFmpeg on downloaded stream(s)');
          await super.doStart();
        }
        return;
      }
  
      this.notifySkip({
        name: 'dependentTaskNotCompleted',
        message: 'One or more dependent tasks did not complete'
      });
    }
    finally {
      for (const { input } of ffmpegParams.inputs) {
        try {
          if (this.config.dryRun || fs.existsSync(input)) {
            this.log('debug', `Clean up "${input}"`);
            this.fsHelper.unlink(input);
          }
        }
        catch (error) {
          this.log('error', `Error cleaning up "${input}":`, error);
        }
      }
    }
  }

  protected async getFFmpegCommandParams(signal?: AbortSignal): Promise<YouTubeFFmpegCommandParams> {
    if (this.#ffmpegCommandParams) {
      return this.#ffmpegCommandParams;
    }

    const videoURL = this.src;

    this.log('debug', `Fetch video info from "${videoURL}"`);
    const videoId = await this.#resolveURL(videoURL);
    const video = await this.#getInfo(videoId);

    this.log('debug', `Choose best-quality stream for YouTube video #${video.basic_info.id}`);
    const stream = await this.#pickStream(video);
    if (!stream) {
      const errMsg = `Stream not found for YouTube video #${video.basic_info.id}`;
      this.log('error', errMsg);
      throw Error(errMsg);
    }

    // Test streams - YT sometimes imposes a delay before the streams become accessible
    const streamURLs: {label: string; url: string; }[] = [];
    if (stream.type === 'separateAV') {
      streamURLs.push(
        { label: 'video stream', url: stream.video.url },
        { label: 'audio stream', url: stream.audio.url }
      );
    }
    else {
      streamURLs.push({ label: 'stream', url: stream.stream.url });
    }
    for (const { label, url } of streamURLs) {
      const startTime = new Date().getTime();
      let tries = 0;
      let testStreamResult = await this.#head(url, signal);
      while (!testStreamResult.ok && tries < 3) {
        if (signal?.aborted) {
          throw Error('Aborted');
        }
        this.log('debug', `(#${video.basic_info.id}) YouTube ${label} validation failed (${testStreamResult.status} - ${testStreamResult.statusText}); retrying after 2s...`);
        await this.#sleep(2000, signal);
        tries++;
        testStreamResult = await this.#head(url, signal);
      }
      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;
      if (tries === 3) {
        this.log('warn', `(#${video.basic_info.id}) failed to validate YouTube ${label} URL "${url}" (retried ${tries} times in ${timeTaken}s).`);
      }
      else {
        this.log('debug', `(#${video.basic_info.id}) YouTube ${label} validated in ${timeTaken}s.`);
      }
    }

    this.#video = video;
    const _quality = stream.type === 'separateAV' ? stream.video.quality : stream.stream.quality;
    const quality = _quality ? ` (${_quality})` : '';
    const basename = `youtube-${video.basic_info.id}${quality}`;
    const inputs: YouTubeFFmpegCommandParams['inputs'] = [];
    const outputOptions: FFmpegCommandParams['outputOptions'] = [];
    let ext = '';

    const __getInputFilePath = <T extends StreamType>(stream: Stream<T>) => {
      const _ext = ITAG_FORMATS[stream.itag]?.ext ? `.${ITAG_FORMATS[stream.itag].ext}` : '';
      return path.resolve(this.#destDir, FSHelper.sanitizeFilename(`${basename}.f${stream.itag}${_ext}`))
    };

    if (stream.type === 'separateAV') {
      this.log('debug', `Obtained separate video and audio stream URLs for YouTube video #${video.basic_info.id}:`);
      this.log('debug', `Video stream URL: ${stream.video.url}`);
      this.log('debug', `Audio stream URL: ${stream.audio.url}`);
      inputs.push(
        {
          input: __getInputFilePath(stream.video),
          stream: stream.video
        },
        {
          input: __getInputFilePath(stream.audio),
          stream: stream.audio,
        }
      );
      outputOptions.push(
        '-map 0:v', // Copy all video streams from videoStreamURL
        '-map 1:a', // Copy all audio streams from audioStreamURL
        '-f mp4',
        '-strict experimental' // Required when muxing Opus audio into MP4 on older FFmpeg versions (< 4.3)
      );
      ext = '.mp4';
    }
    else {
      this.log('debug', `Obtained single stream URL for YouTube video #${video.basic_info.id}:`);
      this.log('debug', `${stream.type === 'audioOnly' ? '(Audio only) '
          : stream.type === 'videoOnly' ? '(Video only) '
            : ''}Stream URL: ${stream.stream.url}`);
      inputs.push({
        input: __getInputFilePath(stream.stream),
        stream: stream.stream
      });
      if (stream.type === 'audioOnly') {
        outputOptions.push('-f m4a');
        ext = '.m4a';
      }
    }
    const output = path.resolve(this.#destDir, FSHelper.sanitizeFilename(`youtube-${video.basic_info.id}${quality}${ext}`));

    this.#ffmpegCommandParams = {
      inputs,
      output,
      outputOptions,
      noProxy: true // Inputs are going to be all local files, so should not use proxy.
    };

    return this.#ffmpegCommandParams;
  }

  protected getTargetDuration(): number | null {
    return this.#video?.basic_info.duration || null;
  }

  async #resolveURL(url: string): Promise<string> {
    if (!YouTubeDownloadTask.#innertubeForResolveURL) {
      YouTubeDownloadTask.#innertubeForResolveURL = await InnertubeLib.Innertube.create();
    }
    const innertube = YouTubeDownloadTask.#innertubeForResolveURL;
    const endpoint = await innertube.resolveURL(url);
    /**
     * Endpoint MUST have `videoId` in its payload.
     * On first resolve of YT shared links ('https://youtu.be/...),
     * this returns `url` in the payload instead of `videoID`. We would
     * have to resolve it once more.
     */
    const payload = endpoint.payload && typeof endpoint.payload === 'object' ? endpoint.payload : null;
    if (payload && Reflect.has(payload, 'videoId')) {
      return payload.videoId;
    }
    if (payload && Reflect.has(payload, 'url')) {
      return this.#resolveURL(payload.url);
    }
    throw Error(`Failed to resolve YouTube URL "${url}": no videoId found`);
  }

  async #pickStream(video: YT.VideoInfo): Promise<StreamBundle | null> {
    const innertube = await this.getInnertube();
    const maxResolution = this.config.maxVideoResolution ?? null;

    // First, get the best streams without filtering
    let bestVideoWithAudio: Misc.Format | null;
    let bestVideo: Misc.Format | null;
    let bestAudio: Misc.Format | null;

    try {
      bestVideoWithAudio = video.chooseFormat({ quality: 'best', type: 'video+audio', format: 'any' });
    }
    catch (_error: unknown) {
      bestVideoWithAudio = null;
    }
    try {
      // `bestVideo` may also contain audio
      bestVideo = video.chooseFormat({ quality: 'best', type: 'video', format: 'any' });
    }
    catch (_error: unknown) {
      bestVideo = null;
    }
    try {
      // `bestAudio` is audio only
      bestAudio = video.chooseFormat({ quality: 'best', type: 'audio', format: 'any' });
    }
    catch (_error: unknown) {
      bestAudio = null;
    }

    // If max resolution is set and video exceeds it, find a lower resolution
    if (maxResolution !== null && maxResolution > 0) {
      const checkAndDowngrade = (format: Misc.Format | null, type: 'video+audio' | 'video'): Misc.Format | null => {
        if (!format || !format.height) {
          return format;
        }

        if (format.height <= maxResolution) {
          // Current format is within limit
          return format;
        }

        // Current format exceeds limit, find best format at or below max resolution
        this.log('debug', `Video resolution ${format.height}p exceeds max ${maxResolution}p, finding lower resolution...`);

        const availableFormats = type === 'video+audio'
          ? (video.streaming_data?.formats || [])
          : (video.streaming_data?.adaptive_formats || []).filter(f => f.has_video);

        // Sort by height descending and find the best one at or below maxResolution
        const suitableFormats = availableFormats
          .filter(f => f.height && f.height <= maxResolution)
          .sort((a, b) => (b.height || 0) - (a.height || 0));

        if (suitableFormats.length > 0) {
          this.log('debug', `Selected ${suitableFormats[0].height}p as alternative`);
          return suitableFormats[0];
        }

        // No suitable format found, use original (better to have high res than nothing)
        this.log('warn', `No video format found at or below ${maxResolution}p, using original ${format.height}p`);
        return format;
      };

      bestVideoWithAudio = checkAndDowngrade(bestVideoWithAudio, 'video+audio');
      bestVideo = checkAndDowngrade(bestVideo, 'video');
      // Audio doesn't need downgrading
    }

    if (!bestVideoWithAudio && !bestVideo && !bestAudio) {
      return null;
    }

    const __decipher = async (format: Misc.Format) => {
      return {
        url: await format.decipher(innertube.session.player),
        quality: {
          video: format.quality_label || format.quality || '',
          audio: format.audio_quality || ''
        },
        itag: format.itag,
        contentLength: format.content_length
      };
    };

    if (bestVideoWithAudio && (
      (bestVideo && bestVideoWithAudio.itag === bestVideo.itag) || (!bestVideo && !bestAudio))) {

      const stream = await __decipher(bestVideoWithAudio);
      return {
        type: 'combinedAV',
        stream: {
          type: 'video+audio',
          quality: stream.quality.video,
          itag: stream.itag,
          contentLength: stream.contentLength,
          url: stream.url,
          cpn: video.cpn
        }
      };
    }

    const videoWithAudioStream = bestVideoWithAudio ? await __decipher(bestVideoWithAudio) : null;
    const videoStream = bestVideo ? await __decipher(bestVideo) : videoWithAudioStream;
    const audioStream = bestAudio ? await __decipher(bestAudio) : videoWithAudioStream;

    if (videoStream && audioStream) {
      return {
        type: 'separateAV',
        video: {
          type: 'video',
          quality: videoStream.quality.video,
          itag: videoStream.itag,
          contentLength: videoStream.contentLength,
          url: videoStream.url,
          cpn: video.cpn
        },
        audio: {
          type: 'audio',
          quality: audioStream.quality.audio,
          itag: audioStream.itag,
          contentLength: audioStream.contentLength,
          url: audioStream.url,
          cpn: video.cpn
        }
      };
    }

    if (videoStream) {
      return {
        type: 'videoOnly',
        stream: {
          type: 'video',
          quality: videoStream.quality.video,
          itag: videoStream.itag,
          contentLength: videoStream.contentLength,
          url: videoStream.url,
          cpn: video.cpn
        }
      };
    }

    if (audioStream) {
      return {
        type: 'audioOnly',
        stream: {
          type: 'audio',
          quality: audioStream.quality.audio,
          itag: audioStream.itag,
          contentLength: audioStream.contentLength,
          url: audioStream.url,
          cpn: video.cpn
        }
      };
    }

    return null;
  }

  #sleep(ms: number, signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        return reject(new Error('Aborted'));
      }

      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);

      const onAbort = () => {
        clearTimeout(timer);
        reject(new Error('Aborted'));
      };

      signal?.addEventListener('abort', onAbort);
    });
  }

  async #head(url: string, signal?: AbortSignal) {
    const res = await fetch(url, { method: 'HEAD', signal, dispatcher: this.#fetcher.proxyAgent });
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText
    };
  }
}
