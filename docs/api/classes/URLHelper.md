[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLHelper

# Class: URLHelper

Defined in: [src/utils/URLHelper.ts:295](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L295)

## Constructors

### Constructor

> **new URLHelper**(): `URLHelper`

#### Returns

`URLHelper`

## Methods

### analyzeURL()

> `static` **analyzeURL**(`url`): `null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

Defined in: [src/utils/URLHelper.ts:457](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L457)

#### Parameters

##### url

`string`

#### Returns

`null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

***

### constructCampaignAPIURL()

> `static` **constructCampaignAPIURL**(`campaignId`): `string`

Defined in: [src/utils/URLHelper.ts:341](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L341)

#### Parameters

##### campaignId

`string`

#### Returns

`string`

***

### constructCampaignPageURL()

> `static` **constructCampaignPageURL**(`user`): `string`

Defined in: [src/utils/URLHelper.ts:317](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L317)

#### Parameters

##### user

[`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

***

### constructCollectionURL()

> `static` **constructCollectionURL**(`collectionId`): `string`

Defined in: [src/utils/URLHelper.ts:333](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L333)

#### Parameters

##### collectionId

`string`

#### Returns

`string`

***

### constructCurrentUserAPIURL()

> `static` **constructCurrentUserAPIURL**(): `string`

Defined in: [src/utils/URLHelper.ts:297](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L297)

#### Returns

`string`

***

### constructPostCommentsAPIURL()

> `static` **constructPostCommentsAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:385](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L385)

#### Parameters

##### params

\{ `count?`: `number`; `postId`: `string`; `replies?`: `false`; \} | \{ `commentId`: `string`; `count?`: `number`; `replies`: `true`; \}

#### Returns

`string`

***

### constructPostsAPIURL()

> `static` **constructPostsAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:345](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L345)

#### Parameters

##### params

###### campaignId?

`string`

###### currentUserId?

`string`

###### filters?

`Record`\<`string`, `any`\>

###### postId?

`string`

###### sort?

[`PostSortOrder`](../enumerations/PostSortOrder.md)

#### Returns

`string`

***

### constructProductAPIURL()

> `static` **constructProductAPIURL**(`productId`): `string`

Defined in: [src/utils/URLHelper.ts:307](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L307)

#### Parameters

##### productId

`string`

#### Returns

`string`

***

### constructShopAPIURL()

> `static` **constructShopAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:421](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L421)

#### Parameters

##### params

###### campaignId

`string`

###### offset?

`number`

#### Returns

`string`

***

### constructUserAPIURL()

> `static` **constructUserAPIURL**(`userId`): `string`

Defined in: [src/utils/URLHelper.ts:337](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L337)

#### Parameters

##### userId

`string`

#### Returns

`string`

***

### constructUserPostsURL()

> `static` **constructUserPostsURL**(`user`): `string`

Defined in: [src/utils/URLHelper.ts:325](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L325)

#### Parameters

##### user

[`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

***

### getExtensionFromURL()

> `static` **getExtensionFromURL**(`url`): `string`

Defined in: [src/utils/URLHelper.ts:581](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L581)

#### Parameters

##### url

`string`

#### Returns

`string`

***

### isAttachmentLink()

> `static` **isAttachmentLink**(`url`): \{ `mediaId`: `string`; `ownerId`: `string`; `validated`: `true`; \} \| \{ `mediaId?`: `undefined`; `ownerId?`: `undefined`; `validated`: `false`; \}

Defined in: [src/utils/URLHelper.ts:598](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L598)

#### Parameters

##### url

`string`

#### Returns

\{ `mediaId`: `string`; `ownerId`: `string`; `validated`: `true`; \} \| \{ `mediaId?`: `undefined`; `ownerId?`: `undefined`; `validated`: `false`; \}

***

### stripSearchParamsFromURL()

> `static` **stripSearchParamsFromURL**(`url`): `string`

Defined in: [src/utils/URLHelper.ts:572](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L572)

#### Parameters

##### url

`string`

#### Returns

`string`

***

### validateURL()

> `static` **validateURL**(`url`): `boolean`

Defined in: [src/utils/URLHelper.ts:586](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/URLHelper.ts#L586)

#### Parameters

##### url

`any`

#### Returns

`boolean`
