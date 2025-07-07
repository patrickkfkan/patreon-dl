[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / URLHelper

# Class: URLHelper

Defined in: [src/utils/URLHelper.ts:170](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L170)

## Constructors

### Constructor

> **new URLHelper**(): `URLHelper`

#### Returns

`URLHelper`

## Methods

### analyzeURL()

> `static` **analyzeURL**(`url`): `null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

Defined in: [src/utils/URLHelper.ts:286](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L286)

#### Parameters

##### url

`string`

#### Returns

`null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

***

### constructCampaignAPIURL()

> `static` **constructCampaignAPIURL**(`campaignId`): `string`

Defined in: [src/utils/URLHelper.ts:206](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L206)

#### Parameters

##### campaignId

`string`

#### Returns

`string`

***

### constructCampaignPageURL()

> `static` **constructCampaignPageURL**(`user`): `string`

Defined in: [src/utils/URLHelper.ts:182](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L182)

#### Parameters

##### user

[`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

***

### constructCollectionURL()

> `static` **constructCollectionURL**(`collectionId`): `string`

Defined in: [src/utils/URLHelper.ts:198](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L198)

#### Parameters

##### collectionId

`string`

#### Returns

`string`

***

### constructPostCommentsAPIURL()

> `static` **constructPostCommentsAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:250](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L250)

#### Parameters

##### params

\{ `count?`: `number`; `postId`: `string`; `replies?`: `false`; \} | \{ `commentId`: `string`; `count?`: `number`; `replies`: `true`; \}

#### Returns

`string`

***

### constructPostsAPIURL()

> `static` **constructPostsAPIURL**(`params`): `string`

Defined in: [src/utils/URLHelper.ts:210](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L210)

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

Defined in: [src/utils/URLHelper.ts:172](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L172)

#### Parameters

##### productId

`string`

#### Returns

`string`

***

### constructUserAPIURL()

> `static` **constructUserAPIURL**(`userId`): `string`

Defined in: [src/utils/URLHelper.ts:202](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L202)

#### Parameters

##### userId

`string`

#### Returns

`string`

***

### constructUserPostsURL()

> `static` **constructUserPostsURL**(`user`): `string`

Defined in: [src/utils/URLHelper.ts:190](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L190)

#### Parameters

##### user

[`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

***

### getExtensionFromURL()

> `static` **getExtensionFromURL**(`url`): `string`

Defined in: [src/utils/URLHelper.ts:400](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L400)

#### Parameters

##### url

`string`

#### Returns

`string`

***

### stripSearchParamsFromURL()

> `static` **stripSearchParamsFromURL**(`url`): `string`

Defined in: [src/utils/URLHelper.ts:391](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L391)

#### Parameters

##### url

`string`

#### Returns

`string`

***

### validateURL()

> `static` **validateURL**(`url`): `boolean`

Defined in: [src/utils/URLHelper.ts:405](https://github.com/patrickkfkan/patreon-dl/blob/13dcc2ff5398507f6088673ed657c12686142841/src/utils/URLHelper.ts#L405)

#### Parameters

##### url

`any`

#### Returns

`boolean`
