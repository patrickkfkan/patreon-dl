[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLAnalysis

# Type Alias: URLAnalysis

> **URLAnalysis** = \{ `productId`: `string`; `slug`: `string`; `type`: `"product"`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUser"`; `vanity`: `string`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUserId"`; `userId`: `string`; \} \| \{ `collectionId`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByCollection"`; \} \| \{ `postId`: `string`; `slug?`: `string`; `type`: `"post"`; \}

Defined in: [src/utils/URLHelper.ts:149](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L149)
