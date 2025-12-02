import { type Collection } from '../../entities/Post.js';

const COLLECTION_INFO_TEMPLATE =
`Collection
----------
ID: {collection.id}
Title: {collection.title}
Description: {collection.description}
Number of Posts: {collection.numPosts}
Created: {collection.createdAt}
Last Edited: {collection.editedAt}
`;

export function generateCollectionSummary(collection: Collection) {
  const collectionInfo = COLLECTION_INFO_TEMPLATE
    .replaceAll('{collection.id}', collection.id)
    .replaceAll('{collection.title}', collection.title || '')
    .replaceAll('{collection.description}', collection.description || '')
    .replaceAll('{collection.numPosts}', String(collection.numPosts ?? ''))
    .replaceAll('{collection.createdAt}', collection.createdAt || '')
    .replaceAll('{collection.editedAt}', collection.editedAt || '')

  return collectionInfo;
}