import { type Product } from '../../entities/Product.js';

const PRODUCT_INFO_TEMPLATE =
`Product
--------
ID: {product.id}
Name: {product.name}
Description: {product.description}
Price: {product.price}
Published: {product.publishedAt}
URL: {product.url}
`;

export function generateProductSummary(product: Product) {
  const productInfo = PRODUCT_INFO_TEMPLATE
    .replaceAll('{product.id}', product.id)
    .replaceAll('{product.name}', product.name || '')
    .replaceAll('{product.description}', product.description || '')
    .replaceAll('{product.price}', product.price || '')
    .replaceAll('{product.publishedAt}', product.publishedAt || '')
    .replaceAll('{product.url}', product.url || '');

  return productInfo;
}
