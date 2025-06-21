import { type Product, type Campaign } from "../../../entities";
import ObjectHelper from "../../../utils/ObjectHelper";

export default class RawDataExtractor {
  static getCampaignCreationName(campaign: Campaign) {
    return ObjectHelper.getProperty(campaign, 'raw.attributes.creation_name');
  }

  static getProductRichTextDescription(product: Product) {
    const rich = ObjectHelper.getProperty(product, 'raw.data.attributes.description_rich_text');
    if (rich) {
      return rich;
    }
    if (product.description) {
      return product.description.replaceAll('\n', '<br />');
    }
    return null;
  }
}