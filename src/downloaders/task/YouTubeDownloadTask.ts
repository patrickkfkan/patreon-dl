import path from 'path';
import { type YT, type Misc, type YTNodes } from 'youtubei.js';
import { type YouTubePostEmbed } from '../../entities/Post.js';
import FFmpegDownloadTaskBase, { type FFmpegCommandParams, type FFmpegDownloadTaskBaseParams } from './FFmpegDownloadTaskBase.js';
import InnertubeLoader from '../../utils/InnertubeLoader.js';
import FSHelper from '../../utils/FSHelper.js';

export interface YouTubeDownloadTaskParams extends FFmpegDownloadTaskBaseParams<YouTubePostEmbed> {
  destDir: string;
}

type StreamURLBundle = {
  quality: string;
} & ({
  hasSeparateAVStreams: false;
  url: string;
  isAudioOnly: boolean;
} | {
  hasSeparateAVStreams: true;
  videoURL: string;
  audioURL: string;
})

export default class YouTubeDownloadTask extends FFmpegDownloadTaskBase<YouTubePostEmbed> {

  name = 'YouTubeDownloadTask';

  #destDir: string;
  #video: YT.VideoInfo | null;
  #ffmpegCommandParams: FFmpegCommandParams | null;

  constructor(params: YouTubeDownloadTaskParams) {
    super(params);
    this.#destDir = params.destDir;
    this.#video = null;
    this.#ffmpegCommandParams = null;
  }

  protected async resolveDestPath() {
    const params = await this.getFFmpegCommandParams();
    return params.output;
  }

  getInnertube() {
    return InnertubeLoader.getInstance();
  }

  protected async getFFmpegCommandParams(): Promise<FFmpegCommandParams> {
    if (this.#ffmpegCommandParams) {
      return this.#ffmpegCommandParams;
    }

    const innertube = await this.getInnertube();
    const videoURL = this.src;

    this.log('debug', `Fetch video info from "${videoURL}"`);
    const endpoint = await this.#resolveURL(videoURL);
    const video = await innertube.getInfo(endpoint);
    
    this.log('debug', `Choose best-quality stream for YouTube video #${video.basic_info.id}`);
    const stream = await this.#pickStream(video);
    if (!stream) {
      const errMsg = `Stream not found for YouTube video #${video.basic_info.id}`;
      this.log('error', errMsg);
      throw Error(errMsg);
    }
    
    this.#video = video;
    const inputs: FFmpegCommandParams['inputs'] = [];
    const outputOptions: FFmpegCommandParams['outputOptions'] = [];
    let ext = '';
    if (stream.hasSeparateAVStreams) {
      this.log('debug', `Obtained separate video and audio stream URLs for YouTube video #${video.basic_info.id}:`);
      this.log('debug', `Video stream URL: ${stream.videoURL}`);
      this.log('debug', `Audio stream URL: ${stream.audioURL}`);
      inputs.push(
        { input: stream.videoURL },
        { input: stream.audioURL }
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
      this.log('debug', `${stream.isAudioOnly ? '(Audio only) ' : ''}Stream URL: ${stream.url}`);
      inputs.push({ input: stream.url });
      if (stream.isAudioOnly) {
        outputOptions.push('-f m4a');
        ext = '.m4a';
      }
    }
    const quality = stream.quality ? ` (${stream.quality})` : '';
    const output = path.resolve(this.#destDir, FSHelper.sanitizeFilename(`youtube-${video.basic_info.id}${quality}${ext}`));

    this.#ffmpegCommandParams = {
      inputs,
      output,
      outputOptions
    };

    return this.#ffmpegCommandParams;
  }

  protected getTargetDuration(): number | null {
    return this.#video?.basic_info.duration || null;
  }

  async #resolveURL(url: string): Promise<YTNodes.NavigationEndpoint> {
    const innertube = await this.getInnertube();
    const endpoint = await innertube.resolveURL(url);
    /**
     * Endpoint MUST have `videoId` in its payload.
     * On first resolve of YT shared links ('https://youtu.be/...),
     * this returns `url` in the payload instead of `videoID`. We would
     * have to resolve it once more.
     */
    const payload = endpoint.payload && typeof endpoint.payload === 'object' ? endpoint.payload : null;
    if (payload && Reflect.has(payload, 'videoId')) {
      return endpoint;
    }
    if (payload && Reflect.has(payload, 'url')) {
      return this.#resolveURL(payload.url);
    }
    throw Error(`Failed to resolve YouTube URL "${url}": no videoId found`);
  }

  async #pickStream(video: YT.VideoInfo): Promise<StreamURLBundle | null> {
    const innertube = await this.getInnertube();
    let bestVideoWithAudio: Misc.Format | null;
    let bestVideo: Misc.Format | null;
    let bestAudio: Misc.Format | null;
    try {
      bestVideoWithAudio = video.chooseFormat({ quality: 'best', type: 'video+audio', format: 'any' });
    }
    catch (error) {
      bestVideoWithAudio = null;
    }
    try {
      // `bestVideo` may also contain audio
      bestVideo = video.chooseFormat({ quality: 'best', type: 'video', format: 'any' });
    }
    catch (error) {
      bestVideo = null;
    }
    try {
      // `bestAudio` is audio only
      bestAudio = video.chooseFormat({ quality: 'best', type: 'audio', format: 'any' });
    }
    catch (error) {
      bestAudio = null;
    }

    if (!bestVideoWithAudio && !bestVideo && !bestAudio) {
      return null;
    }

    const __decipher = (format: Misc.Format) => {
      return {
        url: format.decipher(innertube.session.player),
        quality: {
          video: format.quality_label || format.quality || '',
          audio: format.audio_quality || ''
        }
      };
    };

    if (bestVideoWithAudio && (
      (bestVideo && bestVideoWithAudio.itag === bestVideo.itag) || (!bestVideo && !bestAudio))) {

      const stream = __decipher(bestVideoWithAudio);
      return {
        hasSeparateAVStreams: false,
        url: stream.url,
        isAudioOnly: false,
        quality: stream.quality.video
      };
    }

    const videoWithAudioStream = bestVideoWithAudio ? __decipher(bestVideoWithAudio) : null;
    const videoStream = bestVideo ? __decipher(bestVideo) : videoWithAudioStream;
    const audioStream = bestAudio ? __decipher(bestAudio) : videoWithAudioStream;

    if (videoStream && audioStream) {
      return {
        hasSeparateAVStreams: true,
        videoURL: videoStream.url,
        audioURL: audioStream.url,
        quality: videoStream.quality.video
      };
    }

    if (videoStream) {
      return {
        hasSeparateAVStreams: false,
        url: videoStream.url,
        isAudioOnly: false,
        quality: videoStream.quality.video
      };
    }

    if (audioStream) {
      return {
        hasSeparateAVStreams: false,
        url: audioStream.url,
        isAudioOnly: true,
        quality: audioStream.quality.audio
      };
    }

    return null;
  }
}
