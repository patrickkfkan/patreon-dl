import { type VideoMediaItem } from '../../entities/MediaItem.js';
import { SITE_URL } from '../../utils/URLHelper.js';
import FFmpegDownloadTaskBase, { type FFmpegCommandParams, type FFmpegDownloadTaskBaseParams } from './FFmpegDownloadTaskBase.js';

export interface M3U8DownloadTaskParams extends FFmpegDownloadTaskBaseParams<VideoMediaItem> {
  destFilePath: string;
}

export default class M3U8DownloadTask extends FFmpegDownloadTaskBase<VideoMediaItem> {

  name = 'M3U8DownloadTask';

  #destFilePath: string;

  constructor(params: M3U8DownloadTaskParams) {
    super(params);
    this.#destFilePath = params.destFilePath;
  }

  protected resolveDestPath() {
    return Promise.resolve(this.#destFilePath);
  }

  protected async getFFmpegCommandParams(): Promise<FFmpegCommandParams> {
    const inputOptions = [
      '-protocol_whitelist',
      'http,https,tcp,tls',
      '-headers',
      `Referer: ${SITE_URL}`
    ];
    if (this.getFFmpegVersion().startsWith('7.')) {
      inputOptions.push('-extension_picky', '0');
    }
    return Promise.resolve({
      inputs: [
        {
          input: this.src,
          options: inputOptions
        }
      ],
      output: this.#destFilePath
    });
  }

  protected getTargetDuration(): number | null {
    return this.srcEntity.duration;
  }
}
