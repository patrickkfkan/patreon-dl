import path from 'path';
import FilenameResolver from './FllenameResolver.js';
import FilenameFormatHelper from './FilenameFormatHelper.js';
import { Attachment } from '../entities/Attachment.js';

export default class AttachmentFilenameResolver<T extends Attachment> extends FilenameResolver<T> {

  #format: string;

  constructor(target: T, srcURL: string, format: string) {
    super(target, srcURL);
    this.#format = format;
  }

  resolve(response: Response) {
    const att = this.target;
    // Treat attachment name as filename
    const attNameParts = att.name ? path.parse(att.name) : null;
    const resFilenameParts = this.getFilenamePartsFromResponse(response);

    const filenameParts = {
      name: '',
      ext: ''
    };

    /**
     * Obtain `name` part from (in order of priority):
     * 1. Filename from response headers
     * 2. Attachment name
     * 3. If none of the above is available, fallback to using the media ID
    */
    if (resFilenameParts.name) {
      filenameParts.name = resFilenameParts.name;
    }
    if (attNameParts?.name) {
      filenameParts.name = attNameParts.name;
    }
    else if (!this.#format.includes('{media.id}')) {
      filenameParts.name = att.id;
    }

    /**
     * Obtain `extension` from (in order of priority):
     * 1. Response headers
     * 2. Attachment name
     *
     * Unlike MediaFilenameResolver, do not get ext from srcURL.
     * Download URLs for attachments have no extension
     * (e.g. https://www.patreon.com/file?h=...)
     */
    if (resFilenameParts.ext) {
      filenameParts.ext = resFilenameParts.ext;
    }
    else if (attNameParts?.ext) {
      filenameParts.ext = attNameParts.ext;
    }

    const tmpAtt = {
      ...att,
      name: filenameParts.name
    };

    return FilenameFormatHelper.getAttachmentFilename(tmpAtt, this.#format, filenameParts.ext);
  }
}
