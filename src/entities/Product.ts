import { type Campaign } from './Campaign.js';
import { type Downloadable } from './Downloadable.js';

export interface Product {
  type: 'product';
  id: string;
  isAccessible: boolean;
  name: string | null;
  description: string | null;
  price: string | null;
  publishedAt: string | null;
  url: string;
  previewMedia: Downloadable[];
  contentMedia: Downloadable[];
  campaign: Campaign | null;
  raw: object;
}
