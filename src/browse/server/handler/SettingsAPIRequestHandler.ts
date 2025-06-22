import { type Request, type Response } from 'express';
import { type Logger } from '../../../utils/logging';
import { type APIInstance } from '../../api';
import Basehandler from './BaseHandler.js';
import { type BrowseSettings } from '../../types/Settings.js';

export default class SettingsAPIRequestHandler extends Basehandler {
  name = 'SettingsAPIRequestHandler';

  #api: APIInstance;

  constructor(api: APIInstance, logger?: Logger | null) {
    super(logger);
    this.#api = api;
  }

  async handleGetBrowseSettingsRequest(_req: Request, res: Response) {
    res.json(await this.#api.getBrowseSettings());
  }

  handleBrowseSettingOptionsRequest(_req: Request, res: Response) {
    res.json(this.#api.getBrowseSettingOptions());
  }

  async handleSaveBrowseSettingsRequest(req: Request, res: Response) {
    await this.#api.saveBrowseSettings(this.#retrieveBrowseSettings(req));
    res.sendStatus(200);
  }

  #retrieveBrowseSettings(req: Request) {
    const body = req.body;
    if (this.#isBrowseSettings(body)) {
      return body;
    }
    throw Error('Invalid browse settings data');
  }

  #isBrowseSettings(data: any): data is BrowseSettings {
    if (typeof data !== 'object' || !data) {
      return false;
    }
    const hasValidThemeValue = Reflect.has(data, 'theme') && typeof data.theme === 'string';
    const hasValidListItemsPerPageValue = Reflect.has(data, 'listItemsPerPage') && typeof data.listItemsPerPage === 'number';
    const hasValidGalleryItemsPerPageValue = Reflect.has(data, 'galleryItemsPerPage') && typeof data.galleryItemsPerPage === 'number';
    return hasValidThemeValue && hasValidListItemsPerPageValue && hasValidGalleryItemsPerPageValue;
  }
}