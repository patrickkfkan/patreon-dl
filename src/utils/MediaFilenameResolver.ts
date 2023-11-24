import path from 'path';
import { MediaLike } from '../entities/MediaItem.js';
import { Response } from 'node-fetch';
import FilenameResolver from './FllenameResolver.js';
import URLHelper from './URLHelper.js';
import FilenameFormatHelper from './FilenameFormatHelper.js';

export default class MediaFilenameResolver<T extends MediaLike> extends FilenameResolver<T> {

  #format: string;
  #variant: string | null;

  constructor(target: T, srcURL: string, format: string, variant: string | null, ensureVariant: boolean) {
    super(target, srcURL);
    this.#format = format;
    this.#variant = variant;

    if (ensureVariant && !this.#format.includes('{media.variant}')) {
      this.#format = `${format}[-]?{media.variant}`;
    }
  }

  resolve(response: Response) {
    const mi = this.target;
    const miFilenameParts = mi.filename ? path.parse(mi.filename) : null;
    const resFilenameParts = this.getFilenamePartsFromResponse(response);

    const filenameParts = {
      name: '',
      ext: ''
    };

    /**
     * Obtain `name` part from (in order of priority):
     * 1. Media filename
     * 2. Filename from response headers
     * 3. If none of the above is available, fallback to using the media ID
    */
    if (miFilenameParts?.name) {
      filenameParts.name = miFilenameParts.name;
    }
    else if (resFilenameParts.name) {
      filenameParts.name = resFilenameParts.name;
    }
    else if (!this.#format.includes('{media.id}')) {
      filenameParts.name = mi.id;
    }

    /**
     * Obtain `extension` from (in order of priority):
     * 1. Response headers
     * 2. Media filename
     * 3. Media mimetype
     * 4. Src URL
     */
    if (resFilenameParts.ext) {
      // Use media item filename if the same (preserves case)
      if (miFilenameParts?.ext?.toLowerCase() === resFilenameParts.ext.toLowerCase() &&
        filenameParts.name === miFilenameParts.name && this.#format.includes('{media.filename}')) {

        filenameParts.ext = miFilenameParts.ext;
      }
      else {
        filenameParts.ext = resFilenameParts.ext;
      }
    }
    else if (miFilenameParts?.ext) {
      filenameParts.ext = miFilenameParts.ext;
    }
    else if (mi.mimeType) {
      filenameParts.ext = this.getExtensionByContentType(mi.mimeType);
    }
    else {
      filenameParts.ext = URLHelper.getExtensionFromURL(this.srcURL);
    }

    const tmpMI = {
      ...mi,
      filename: filenameParts.name,
      variant: this.#variant
    };

    let resolvedFilename = FilenameFormatHelper.getMediaFilename(tmpMI, this.#format);
    if (filenameParts.ext) {
      resolvedFilename += filenameParts.ext;
    }

    return resolvedFilename;
  }
}
