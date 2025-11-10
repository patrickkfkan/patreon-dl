[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLHelper

# Class: URLHelper

Defined in: [src/utils/URLHelper.ts:171](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L171)

## Constructors

### Constructor

> **new URLHelper**(): `URLHelper`

#### Returns

`URLHelper`

## Methods

### analyzeURL()

> `static` **analyzeURL**(`url`): `null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

Defined in: [src/utils/URLHelper.ts:297](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L297)

#### Parameters

##### url

`string`

#### Returns

`null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

***

### constructCampaignAPIURL()

> `static` **constructCampaignAPIURL**(`campaignId`): `string`

Defined in: [src/utils/URLHelper.ts:217](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L217)

#### Parameters

##### campaignId

`string`

#### Returns

`string`

***

### constructCampaignPageURL()

> `static` **constructCampaignPageURL**(`user`): `string`

Defined in: [src/utils/URLHelper.ts:193](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L193)

#### Parameters

##### user

[`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

***

### constructCollectionURL()

> `static` **constructCollectionURL**(`collectionId`): `string`

Defined in: [src/utils/URLHelper.ts:209](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L209)

#### Parameters

##### collectionId

`string`

#### Returns

`string`

***

### constructCurrentUserAPIURL()

> `static` **constructCurrentUserAPIURL**(): `string`

Defined in: [src/utils/URLHelper.ts:173](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L173)

#### Returns

`string`

***

### constructPostCommentsAPIURL()

> `static` **constructPostCommentsAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:261](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L261)

#### Parameters

##### params

\{ `count?`: `number`; `postId`: `string`; `replies?`: `false`; \} | \{ `commentId`: `string`; `count?`: `number`; `replies`: `true`; \}

#### Returns

`string`

***

### constructPostsAPIURL()

> `static` **constructPostsAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:221](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L221)

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

Defined in: [src/utils/URLHelper.ts:183](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L183)

#### Parameters

##### productId

`string`

#### Returns

`string`

***

### constructUserAPIURL()

> `static` **constructUserAPIURL**(`userId`): `string`

Defined in: [src/utils/URLHelper.ts:213](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L213)

#### Parameters

##### userId

`string`

#### Returns

`string`

***

### constructUserPostsURL()

> `static` **constructUserPostsURL**(`user`): `string`

Defined in: [src/utils/URLHelper.ts:201](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L201)

#### Parameters

##### user

[`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

***

### getExtensionFromURL()

> `static` **getExtensionFromURL**(`url`): `string`

Defined in: [src/utils/URLHelper.ts:411](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L411)

#### Parameters

##### url

`string`

#### Returns

`string`

***

### isAttachmentLink()

> `static` **isAttachmentLink**(`url`): \{ `mediaId`: `string`; `ownerId`: `string`; `validated`: `true`; \} \| \{ `mediaId?`: `undefined`; `ownerId?`: `undefined`; `validated`: `false`; \}

Defined in: [src/utils/URLHelper.ts:428](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L428)

#### Parameters

##### url

`string`

#### Returns

\{ `mediaId`: `string`; `ownerId`: `string`; `validated`: `true`; \} \| \{ `mediaId?`: `undefined`; `ownerId?`: `undefined`; `validated`: `false`; \}

***

### stripSearchParamsFromURL()

> `static` **stripSearchParamsFromURL**(`url`): `string`

Defined in: [src/utils/URLHelper.ts:402](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L402)

#### Parameters

##### url

`string`

#### Returns

`string`

***

### validateURL()

> `static` **validateURL**(`url`): `boolean`

Defined in: [src/utils/URLHelper.ts:416](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/URLHelper.ts#L416)

#### Parameters

##### url

`any`

#### Returns

`boolean`
