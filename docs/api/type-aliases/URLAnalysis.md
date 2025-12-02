[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLAnalysis

# Type Alias: URLAnalysis

> **URLAnalysis** = \{ `productId`: `string`; `slug`: `string`; `type`: `"product"`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUser"`; `vanity`: `string`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUserId"`; `userId`: `string`; \} \| \{ `collectionId`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByCollection"`; \} \| \{ `postId`: `string`; `slug?`: `string`; `type`: `"post"`; \} \| \{ `type`: `"shop"`; `vanity`: `string`; \}

Defined in: [src/utils/URLHelper.ts:270](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L270)
