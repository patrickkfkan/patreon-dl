import { type Request, type Response } from 'express';
import { type Logger } from '../../../utils/logging';
import { type DBInstance } from '../../db';
import path from 'path';
import fs from 'fs';
import Basehandler from './BaseHandler.js';
import { type Downloaded } from '../../../entities';

export default class MediaRequestHandler extends Basehandler {
  name = 'MediaRequestHandler';

  #db: DBInstance;
  #dataDir: string;

  constructor(db: DBInstance, dataDir: string, logger?: Logger | null) {
    super(logger);
    this.#db = db;
    this.#dataDir = dataDir;
  }

  handleMediaRequest(req: Request, res: Response, id: string) {
    const { t: isRequestingThumbnail } = req.query;
    const { lapid } = req.query; // Linked attachment parent post Id
    let downloaded: Downloaded | null | undefined = null;
    if (lapid) {
      const post = this.#db.getContent(lapid as string, 'post');
      const la = post?.linkedAttachments?.find((att) => att.mediaId === id);
      downloaded = la?.downloadable?.downloaded;
    }
    else {
      downloaded = this.#db.getMediaByID(id);
    }
    let mediaFilePath: string | null = null, isThumbnail = false;
    if (isRequestingThumbnail && downloaded?.thumbnail?.path) {
      const thumbnailFilePath = path.resolve(this.#dataDir, downloaded.thumbnail.path);
      if (fs.existsSync(thumbnailFilePath)) {
        mediaFilePath = thumbnailFilePath;
        isThumbnail = true;
      }
    }
    if (!mediaFilePath) {
      mediaFilePath = downloaded?.path ? path.resolve(this.#dataDir, downloaded.path) : null;
    }
    if (isRequestingThumbnail && mediaFilePath && !isThumbnail && downloaded?.mimeType && !downloaded.mimeType.startsWith('image/')) {
        this.log('warn', `Thumbnail for media file "${mediaFilePath}" unavailable`);
        res.status(404).send('Media not found');
        return;
    }
    if (!downloaded || !mediaFilePath || !fs.existsSync(mediaFilePath)) {
      if (mediaFilePath) {
        this.log('warn', `Media file "${mediaFilePath}" not found`);
      }
      res.status(404).send('Media not found');
      return;
    }
    const isVideo = downloaded.mimeType?.startsWith('video/');
    if (isThumbnail || !isVideo || !req.headers.range) {
      let mimeType: string | null;
      if (isThumbnail) {
        mimeType = downloaded.thumbnail?.mimeType || null;
      }
      else {
        mimeType = downloaded.mimeType || null;
      }
      const headers = mimeType ? { 'Content-Type': mimeType } : undefined;
      res.sendFile(mediaFilePath, { headers, dotfiles: 'allow' });
    }
    else {
      const range = req.headers.range;
        if (!range) {
          res.status(416).send('Requires Range header');
          return;
        }
        const fileSize = fs.statSync(mediaFilePath).size;
        const chunkSize = 10 ** 6; // 1MB chunks
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + chunkSize, fileSize - 1);

        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': downloaded.mimeType || undefined
        };

        res.writeHead(206, headers);
        const stream = fs.createReadStream(mediaFilePath, { start, end });
        stream.pipe(res);
    }
  }
}


