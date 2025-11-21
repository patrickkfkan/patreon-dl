import { type Campaign } from '../entities/Campaign.js';
import { type Downloadable } from '../entities/Downloadable.js';
import { type ProductList } from '../entities/Product.js';
import ObjectHelper from '../utils/ObjectHelper.js';
import Parser from './Parser.js';

export default class ProductParser extends Parser {

  protected name = 'ProductParser';

  parseProductsAPIResponse(json: any, _url: string, _campaign?: Campaign | null): ProductList {

    this.log('debug', `Parse API response of "${_url}"`);

    /*If (json.errors) {
      this.log('error', `API response error:`, json.errors);
      return null;
    }*/

    const includedJSON = json.included;
    const dataJSON = json.data;
    let productsJSONArray: any[];
    // Check if API data consists of just a single product (not an array).
    // If so, place the product data in an array.
    if (dataJSON && !Array.isArray(dataJSON) && dataJSON.type === 'product-variant') {
      productsJSONArray = [dataJSON];
    }
    // If API data is an array, filter out those matching 'product-variant' type (they should all be).
    else if (dataJSON && Array.isArray(dataJSON)) {
      productsJSONArray = dataJSON.filter((data) => data.type === 'product-variant');
    }
    else {
      // No products found
      productsJSONArray = [];
    }
    const collection: ProductList = {
      url: _url,
      items: [],
      total: ObjectHelper.getProperty(json, 'meta.count') || null,
      nextURL: ObjectHelper.getProperty(json, 'links.next') || null
    };

    let hasIncludedJSON = true;
    if (!includedJSON || !Array.isArray(includedJSON)) {
      this.log('warn', `'included' field missing in API response of "${_url}" or has incorrect type - no media items and campaign info will be returned`);
      hasIncludedJSON = false;
    }

    if (productsJSONArray.length === 0) {
      this.log('warn', `No products found in API response of "${_url}"`);
      return collection;
    }
    if (productsJSONArray.length > 1) {
      this.log('debug', `${productsJSONArray.length} products found - iterate and parse`);
    }
    else {
      this.log('debug', '1 product found - parse');
    }

    let campaign: Campaign | null | undefined = _campaign;

    for (const productJSON of productsJSONArray) {
      if (!productJSON || typeof productJSON !== 'object') {
        this.log('error', 'Parse error: API data of product has incorrect type');
        continue;
      }

      const { id, attributes, relationships = {} } = productJSON;

      if (!id) {
        this.log('error', 'Parse error: \'id\' field missing in API data of product');
        continue;
      }

      this.log('debug', `Parse product #${id}`);

      if (!attributes || typeof attributes !== 'object') {
        this.log('error', `Parse error: 'attributes' field missing in API data of product #${id} or has incorrect type`);
        continue;
      }

      // Campaign info
      if (campaign === undefined) {
        const campaignId = ObjectHelper.getProperty(productJSON, 'relationships.campaign.data.id') || null;
        if (!campaignId || typeof campaignId !== 'string') {
          this.log('warn', `Campaign ID missing in API data of product #${id} or has incorrect type` +
            ' - no campaign info will be available until campaign ID is obtained');
        }
        else if (hasIncludedJSON) {
          campaign = this.findInAPIResponseIncludedArray(includedJSON, campaignId, 'campaign');
        }
      }

      // Is accessible?
      let isAccessible = false;
      const accessMetadata = attributes.access_metadata;
      if (accessMetadata && Array.isArray(accessMetadata)) {
        isAccessible = accessMetadata.some((acc) => acc.access_created_at);
      }

      let previewMedia: Downloadable[];
      let contentMedia: Downloadable[];
      if (hasIncludedJSON) {
        const downloadables = this.fetchDownloadablesFromRelationships(
          relationships,
          {
            'preview_media': 'preview media',
            'content_media': 'content media'
          },
          includedJSON,
          `product #${id}`,
          isAccessible
        );
        previewMedia = downloadables['preview_media'] || [];
        contentMedia = downloadables['content_media'] || [];
      }
      else {
        previewMedia = [];
        contentMedia = [];
      }

      const {
        name = null,
        description = null,
        published_at_datetime: publishedAt = null,
        url = _url
      } = attributes;

      let price: string | null = null;
      if (attributes.price_cents !== undefined && !isNaN(Number(attributes.price_cents))) {
        const currency = campaign?.currency ? ` ${campaign?.currency}` : '';
        price = `${Number(attributes.price_cents) / 100}${currency}`;
      }

      this.log('debug', `Done parsing product #${id}`);

      collection.items.push({
        id,
        type: 'product',
        productType: ObjectHelper.getProperty(attributes, 'content_type'),
        isAccessible,
        name,
        description,
        price,
        publishedAt,
        url,
        campaign: null,
        previewMedia,
        contentMedia,
        raw: json
      });
    }

    if (campaign) {
      this.log('debug', `Campaign #${campaign.id} found while parsing products`);
      for (const product of collection.items) {
        product.campaign = campaign;
      }
    }
    else {
      this.log('warn', 'No campaign info found while parsing products');
    }

    this.log('debug', 'Done parsing products');

    return collection;
  }
}
