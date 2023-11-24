import { Campaign } from '../entities/Campaign.js';
import { Downloadable } from '../entities/Downloadable.js';
import { Product } from '../entities/Product.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import Parser from './Parser.js';

export default class ProductParser extends Parser {

  protected name = 'ProductParser';

  parseProductAPIResponse(json: any, _url: string, _id: string): Product {
    const campaignId = ObjectHelper.getProperty(json, 'data.relationships.campaign.data.id') || null;
    const includedJSON = json.included;

    this.log('debug', `Parse API response for product #${_id}`);

    let hasIncludedJSON = true;
    if (!includedJSON || !Array.isArray(includedJSON)) {
      this.log('warn', `'included' field missing in API data of product #${_id} or has incorrect type - no media items and campaign info will be returned`);
      hasIncludedJSON = false;
    }

    let campaign: Campaign | null = null;
    if (!campaignId || typeof campaignId !== 'string') {
      this.log('warn', `Campaign ID missing in API data of product #${_id} or has incorrect type - no campaign info will be available`);
    }
    else if (hasIncludedJSON) {
      campaign = this.findInAPIResponseIncludedArray(includedJSON, campaignId, 'campaign');
    }

    let previewMedia: Downloadable[];
    let contentMedia: Downloadable[];
    if (hasIncludedJSON) {
      const relationships = ObjectHelper.getProperty(json, 'data.relationships') || {};
      const downloadables = this.fetchDownloadablesFromRelationships(
        relationships,
        {
          'preview_media': 'preview media',
          'content_media': 'content media'
        },
        includedJSON,
        `product #${_id}`
      );
      previewMedia = downloadables['preview_media'] || [];
      contentMedia = downloadables['content_media'] || [];
    }
    else {
      previewMedia = [];
      contentMedia = [];
    }

    const id = ObjectHelper.getProperty(json, 'data.id') || _id;
    const attributes = ObjectHelper.getProperty(json, 'data.attributes') || {};
    const {
      name = null,
      description = null,
      published_at_datetime: publishedAt = null,
      url = _url
    } = attributes;

    // Is accessible?
    let isAccessible = false;
    const accessMetadata = attributes.access_metadata;
    if (accessMetadata && Array.isArray(accessMetadata)) {
      isAccessible = accessMetadata.some((acc) => acc.access_created_at);
    }

    let price: string | null = null;
    if (attributes.price_cents !== undefined && !isNaN(Number(attributes.price_cents))) {
      const currency = campaign?.currency ? ` ${campaign?.currency}` : '';
      price = `${Number(attributes.price_cents) / 100}${currency}`;
    }

    this.log('debug', `Done parsing product #${id}`);

    return {
      id,
      type: 'product',
      isAccessible,
      name,
      description,
      price,
      publishedAt,
      url,
      campaign,
      previewMedia,
      contentMedia,
      raw: json
    };
  }
}
