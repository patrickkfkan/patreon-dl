[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLAnalysis

# Type Alias: URLAnalysis

> **URLAnalysis** = \{ `productId`: `string`; `slug`: `string`; `type`: `"product"`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUser"`; `vanity`: `string`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUserId"`; `userId`: `string`; \} \| \{ `collectionId`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByCollection"`; \} \| \{ `postId`: `string`; `slug?`: `string`; `type`: `"post"`; \}

Defined in: [src/utils/URLHelper.ts:148](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/URLHelper.ts#L148)
