[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / URLHelper

# Class: URLHelper

## Constructors

### new URLHelper()

> **new URLHelper**(): [`URLHelper`](URLHelper.md)

#### Returns

[`URLHelper`](URLHelper.md)

## Methods

### analyzeURL()

> `static` **analyzeURL**(`url`): `null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

#### Parameters

• **url**: `string`

#### Returns

`null` \| [`URLAnalysis`](../type-aliases/URLAnalysis.md)

#### Defined in

[src/utils/URLHelper.ts:286](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L286)

***

### constructCampaignAPIURL()

> `static` **constructCampaignAPIURL**(`campaignId`): `string`

#### Parameters

• **campaignId**: `string`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:206](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L206)

***

### constructCampaignPageURL()

> `static` **constructCampaignPageURL**(`user`): `string`

#### Parameters

• **user**: [`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:182](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L182)

***

### constructCollectionURL()

> `static` **constructCollectionURL**(`collectionId`): `string`

#### Parameters

• **collectionId**: `string`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:198](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L198)

***

### constructPostCommentsAPIURL()

> `static` **constructPostCommentsAPIURL**(`params`): `string`

#### Parameters

• **params**: `object` \| `object`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:250](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L250)

***

### constructPostsAPIURL()

> `static` **constructPostsAPIURL**(`params`): `string`

#### Parameters

• **params**

• **params.campaignId?**: `string`

• **params.currentUserId?**: `string`

• **params.filters?**: `Record`\<`string`, `any`\>

• **params.postId?**: `string`

• **params.sort?**: [`PostSortOrder`](../enumerations/PostSortOrder.md)

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:210](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L210)

***

### constructProductAPIURL()

> `static` **constructProductAPIURL**(`productId`): `string`

#### Parameters

• **productId**: `string`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:172](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L172)

***

### constructUserAPIURL()

> `static` **constructUserAPIURL**(`userId`): `string`

#### Parameters

• **userId**: `string`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:202](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L202)

***

### constructUserPostsURL()

> `static` **constructUserPostsURL**(`user`): `string`

#### Parameters

• **user**: [`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:190](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L190)

***

### getExtensionFromURL()

> `static` **getExtensionFromURL**(`url`): `string`

#### Parameters

• **url**: `string`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:400](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L400)

***

### stripSearchParamsFromURL()

> `static` **stripSearchParamsFromURL**(`url`): `string`

#### Parameters

• **url**: `string`

#### Returns

`string`

#### Defined in

[src/utils/URLHelper.ts:391](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L391)

***

### validateURL()

> `static` **validateURL**(`url`): `boolean`

#### Parameters

• **url**: `any`

#### Returns

`boolean`

#### Defined in

[src/utils/URLHelper.ts:405](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/URLHelper.ts#L405)
