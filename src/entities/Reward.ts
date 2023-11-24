import { Downloadable } from './Downloadable.js';

export interface Reward {
  type: 'reward';
  id: string;
  title: string | null;
  description: string | null;
  amount: string | null;
  createdAt: string | null;
  publishedAt: string | null;
  editedAt: string | null;
  image: Downloadable | null;
  url: string | null;
}
