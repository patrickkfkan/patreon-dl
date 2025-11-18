import { type Campaign } from './Campaign.js';
import { type Collection } from './Collection.js';
import { type Downloadable } from './Downloadable.js';

export type ProductCollection = Collection<Product>;

// Known productType values
export const ProductType = {
  DigitalCommerce: 'digital_commerce',
  Post: 'post',
  Collection: 'collection'
} as const;

export interface Product {
  type: 'product';
  id: string;
  /**
   * If `undefined`, assume `ProductType.DigitalCommerce`.
   * 
   * @since 3.5.0
   */
  productType?: string;
  /**
   * ID of entity referenced according to `productType` (post or collection)
   * 
   * @since 3.5.0
   */
  referencedEntityId?: string;
  isAccessible: boolean;
  name: string | null;
  description: string | null;
  price: string | null;
  publishedAt: string | null;
  // The URL depends on `productType`:
  // `ProductType.Post`: post URL.
  // `ProductType.Collection`: collection URL.
  // `ProductType.DigitalCommerce`: product URL.
  url: string;
  previewMedia: Downloadable[];
  contentMedia: Downloadable[];
  campaign: Campaign | null;
  raw: object;
}
