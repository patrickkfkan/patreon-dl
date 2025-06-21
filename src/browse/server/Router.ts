import express, { type Router } from 'express';
import path from 'path';
import CampaignAPIRequestHandler from './handler/CampaignAPIRequesthandler.js';
import { type DBInstance } from '../db/index.js';
import { type Logger } from '../../utils/logging/index.js';
import { type APIInstance } from '../api/index.js';
import ContentAPIRequestHandler from './handler/ContentAPIRequestHandler.js';
import MediaRequestHandler from './handler/MediaRequestHandler.js';
import SettingsAPIRequestHandler from './handler/SettingsAPIRequestHandler.js';
import MediaAPIRequestHandler from './handler/MediaAPIRequestHandler.js';

interface RequestHandlers {
  campaignAPI: CampaignAPIRequestHandler;
  contentAPI: ContentAPIRequestHandler;
  media: MediaRequestHandler;
  settingsAPI: SettingsAPIRequestHandler;
  mediaAPI: MediaAPIRequestHandler;
}

class _Router {
  #handlers: RequestHandlers;
  #router: Router;

  constructor(handlers: RequestHandlers) {
    this.#handlers = handlers;
    this.#router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.#router.get([
      '/api/campaigns/:id/posts/filter_options',
      '/api/campaigns/:id/products/filter_options',
      '/api/campaigns/:id/media/filter_options'
    ], (req, res) => {
      const paramContentType = req.path.split('/')[4];
      const contentType =
        paramContentType === 'posts' ? 'post'
        : paramContentType === 'products' ? 'product'
        : 'media';
      switch (contentType) {
        case 'media':
          return this.#handlers.mediaAPI.handleFilterOptionsRequest(req, res, req.params.id);
        default:
          return this.#handlers.contentAPI.handleFilterOptionsRequest(req, res, req.params.id, contentType)
      }
    });

    this.#router.get([
      '/api/campaigns/:id/posts',
      '/api/campaigns/:id/products',
      '/api/campaigns/:id/media',
      '/api/campaigns/:id/content',
    ], (req, res) => {
      const paramContentType = req.path.split('/')[4];
      const contentType =
        paramContentType === 'posts' ? 'post'
        : paramContentType === 'products' ? 'product'
        : paramContentType === 'media' ? 'media'
        : undefined;
      switch (contentType) {
        case 'media':
          return this.#handlers.mediaAPI.handleListRequest(req, res, req.params.id);
        default:
          return this.#handlers.contentAPI.handleListRequest(req, res, req.params.id, contentType)
      }
    });

    this.#router.get('/api/campaigns/:id', (req, res) =>
      this.#handlers.campaignAPI.handleGetRequest(req, res, req.params.id)
    );

    this.#router.get('/api/campaigns', (req, res) =>
      this.#handlers.campaignAPI.handleListRequest(req, res)
    );

    this.#router.get('/api/posts/:id', (req, res) =>
      this.#handlers.contentAPI.handleGetRequest(req, res, 'post', req.params.id)
    );

    this.#router.get('/api/products/:id', (req, res) =>
      this.#handlers.contentAPI.handleGetRequest(req, res, 'product', req.params.id)
    );

    this.#router.get('/api/settings/browse/options', (req, res) =>
      this.#handlers.settingsAPI.handleBrowseSettingOptionsRequest(req, res)
    );

    this.#router.get('/api/settings/browse', (req, res) =>
      this.#handlers.settingsAPI.handleGetBrowseSettingsRequest(req, res)
    );

    this.#router.post('/api/settings/browse', (req, res) =>
      this.#handlers.settingsAPI.handleSaveBrowseSettingsRequest(req, res)
    );

    this.#router.get('/media/:id', (req, res) =>
      this.#handlers.media.handleMediaRequest(req, res, req.params.id)
    );

    this.#router.get(/(.*)/, (_req, res) => {
      res.sendFile(path.resolve(import.meta.dirname, '../web/index.html'))
    });
  }

  get router() {
    return this.#router;
  }
}

export function getRouter(
  db: DBInstance,
  api: APIInstance,
  dataDir: string,
  logger?: Logger | null
) {
  return new _Router({
    campaignAPI: new CampaignAPIRequestHandler(api, logger),
    contentAPI: new ContentAPIRequestHandler(api, logger),
    media: new MediaRequestHandler(db, dataDir, logger),
    settingsAPI: new SettingsAPIRequestHandler(api, logger),
    mediaAPI: new MediaAPIRequestHandler(api, logger)
  }).router;
}
