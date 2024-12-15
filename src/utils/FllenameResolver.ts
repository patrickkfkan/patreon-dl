import contentDisposition from 'content-disposition';
import mimeTypes from 'mime-types';
import path from 'path';
import URLHelper from './URLHelper.js';

/**
 * Used by `Fetcher.download()` to resolve the destination filename
 * of the downloaded item. The resolver implementation depends on the
 * type of target being downloaded. `resolve()` is called with the
 * `Response` object fetched by `Fetcher`, since filename resolution could
 * use data provided in the response headers.
 */

export default abstract class FilenameResolver<T> {

  protected target: T;
  protected srcURL: string;

  constructor(target: T, srcURL: string) {
    this.target = target;
    this.srcURL = srcURL;
  }

  abstract resolve(response: Response): string;

  protected getFilenamePartsFromResponse(response: Response, extByContentType = true) {
    const parts = {
      name: '',
      ext: ''
    };

    const disposition = response.headers.get('content-disposition');
    if (disposition) {
      const parsedDisposition = contentDisposition.parse(disposition);
      const filename = parsedDisposition.parameters['filename'] || null;
      if (filename) {
        const parsed = path.parse(filename);
        parts.name = parsed.name;
        parts.ext = parsed.ext;
      }
    }
    // Filename obtained from content-disposition could have wrong extension.
    // The default behavior is to obtain extension from content-type header if available.
    if (extByContentType) {
      const contentType = response.headers.get('content-type') || null;
      if (contentType) {
        const _extByContentType = this.getExtensionByContentType(contentType);
        if (_extByContentType) {
          parts.ext = _extByContentType;
        }
      }
    }

    return parts;
  }

  protected getExtensionByContentType(type: string) {
    const undeterminable = [
      'application/octet-stream',
      'text/plain'
    ];
    if (undeterminable.find((v) => type.includes(v))) {
      return '';
    }
    const extFromURL = URLHelper.getExtensionFromURL(this.srcURL);
    // Mime-types does not recognize 'application/x-mpegURL'
    if (type === 'application/x-mpegURL' && extFromURL === '.m3u8') {
      return '.m3u8';
    }
    // Mime-types returns '.mpga' for 'audio/mpeg' - we want '.mp3'
    else if (type === 'audio/mpeg' && extFromURL === '.mp3') {
      return '.mp3';
    }
    let ext = mimeTypes.extension(type);
    if (ext === 'jpeg') {
      ext = 'jpg';
    }
    return ext ? `.${ext}` : '';
  }
}
