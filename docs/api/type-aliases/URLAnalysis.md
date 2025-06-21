[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLAnalysis

# Type Alias: URLAnalysis

> **URLAnalysis** = \{ `productId`: `string`; `slug`: `string`; `type`: `"product"`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUser"`; `vanity`: `string`; \} \| \{ `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByUserId"`; `userId`: `string`; \} \| \{ `collectionId`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"postsByCollection"`; \} \| \{ `postId`: `string`; `slug?`: `string`; `type`: `"post"`; \}

Defined in: [src/utils/URLHelper.ts:148](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/URLHelper.ts#L148)
