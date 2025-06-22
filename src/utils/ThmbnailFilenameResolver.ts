import { type Response } from 'undici';
import FilenameResolver from './FllenameResolver.js';
import URLHelper from './URLHelper.js';
import { type DownloadableWithThumbnail } from '../entities/Downloadable.js';
import FSHelper from './FSHelper.js';

export default class ThumbnailFilenameResolver<T extends DownloadableWithThumbnail & { thumbnailURL: string; } > extends FilenameResolver<T> {

  constructor(target: T) {
    super(target, target.thumbnailURL);
  }

  resolve(response: Response) {
    /**
     * Obtain `extension` from (in order of priority):
     * 1. Response headers
     * 2. Src URL
     */
    const resFilenameParts = this.getFilenamePartsFromResponse(response);
    return FSHelper.createFilename({
      name: this.target.id,
      ext: resFilenameParts.ext || URLHelper.getExtensionFromURL(this.srcURL)
    });
  }
}
