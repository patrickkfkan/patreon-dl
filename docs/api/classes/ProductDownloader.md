[patreon-dl](../README.md) / ProductDownloader

# Class: ProductDownloader

## Hierarchy

- [`Downloader`](Downloader.md)\<[`Product`](../interfaces/Product.md)\>

  ↳ **`ProductDownloader`**

## Table of contents

### Constructors

- [constructor](ProductDownloader.md#constructor)

### Properties

- [name](ProductDownloader.md#name)
- [version](ProductDownloader.md#version)

### Methods

- [emit](ProductDownloader.md#emit)
- [getConfig](ProductDownloader.md#getconfig)
- [off](ProductDownloader.md#off)
- [on](ProductDownloader.md#on)
- [once](ProductDownloader.md#once)
- [start](ProductDownloader.md#start)
- [getCampaign](ProductDownloader.md#getcampaign)
- [getInstance](ProductDownloader.md#getinstance)

## Constructors

### constructor

• **new ProductDownloader**(`bootstrap`, `options?`): [`ProductDownloader`](ProductDownloader.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `bootstrap` | [`ProductDownloaderBootstrapData`](../interfaces/ProductDownloaderBootstrapData.md) |
| `options?` | [`DownloaderOptions`](../interfaces/DownloaderOptions.md) |

#### Returns

[`ProductDownloader`](ProductDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[constructor](Downloader.md#constructor)

#### Defined in

[src/downloaders/Downloader.ts:49](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L49)

## Properties

### name

• **name**: `string` = `'ProductDownloader'`

#### Overrides

[Downloader](Downloader.md).[name](Downloader.md#name)

#### Defined in

[src/downloaders/ProductDownloader.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/ProductDownloader.ts#L17)

___

### version

▪ `Static` **version**: `string` = `'1.0.1'`

#### Defined in

[src/downloaders/ProductDownloader.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/ProductDownloader.ts#L15)

## Methods

### emit

▸ **emit**\<`T`\>(`event`, `args`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderEvent`](../README.md#downloaderevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `args` | [`DownloaderEventPayloadOf`](../README.md#downloadereventpayloadof)\<`T`\> |

#### Returns

`boolean`

#### Inherited from

[Downloader](Downloader.md).[emit](Downloader.md#emit)

#### Defined in

[src/downloaders/Downloader.ts:450](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L450)

___

### getConfig

▸ **getConfig**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `dirNameFormat` | \{ readonly campaign: string; readonly content: string; } |
| `fileExistsAction` | \{ readonly content: FileExistsAction; readonly info: FileExistsAction; readonly infoAPI: FileExistsAction; } |
| `filenameFormat` | \{ readonly media: string; } |
| `include` | \{ readonly lockedContent: boolean; readonly postsWithMediaType: "none" \| "any" \| readonly ("attachment" \| "audio" \| "video" \| "image")[]; readonly postsInTier: readonly string[] \| "any"; readonly campaignInfo: boolean; readonly contentInfo: boolean; readonly previewMedia: boolean \| readonly ("audio" \| ... 1 more ...... |
| `outDir` | `string` |
| `pathToFFmpeg` | ``null`` \| `string` |
| `pathToYouTubeCredentials` | ``null`` \| `string` |
| `productId` | `string` |
| `request` | \{ readonly maxRetries: number; readonly maxConcurrent: number; readonly minTime: number; } |
| `targetURL` | `string` |
| `useStatusCache` | `boolean` |

#### Inherited from

[Downloader](Downloader.md).[getConfig](Downloader.md#getconfig)

#### Defined in

[src/downloaders/Downloader.ts:376](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L376)

___

### off

▸ **off**\<`T`\>(`event`, `listener`): [`ProductDownloader`](ProductDownloader.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderEvent`](../README.md#downloaderevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | (`args`: [`DownloaderEventPayloadOf`](../README.md#downloadereventpayloadof)\<`T`\>) => `void` |

#### Returns

[`ProductDownloader`](ProductDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[off](Downloader.md#off)

#### Defined in

[src/downloaders/Downloader.ts:445](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L445)

___

### on

▸ **on**\<`T`\>(`event`, `listener`): [`ProductDownloader`](ProductDownloader.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderEvent`](../README.md#downloaderevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | (`args`: [`DownloaderEventPayloadOf`](../README.md#downloadereventpayloadof)\<`T`\>) => `void` |

#### Returns

[`ProductDownloader`](ProductDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[on](Downloader.md#on)

#### Defined in

[src/downloaders/Downloader.ts:435](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L435)

___

### once

▸ **once**\<`T`\>(`event`, `listener`): [`ProductDownloader`](ProductDownloader.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderEvent`](../README.md#downloaderevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | (`args`: [`DownloaderEventPayloadOf`](../README.md#downloadereventpayloadof)\<`T`\>) => `void` |

#### Returns

[`ProductDownloader`](ProductDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[once](Downloader.md#once)

#### Defined in

[src/downloaders/Downloader.ts:440](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L440)

___

### start

▸ **start**(`params?`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`DownloaderStartParams`](../interfaces/DownloaderStartParams.md) |

#### Returns

`Promise`\<`void`\>

#### Overrides

[Downloader](Downloader.md).[start](Downloader.md#start)

#### Defined in

[src/downloaders/ProductDownloader.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/ProductDownloader.ts#L21)

___

### getCampaign

▸ **getCampaign**(`vanity`, `signal?`, `logger?`): `Promise`\<``null`` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `vanity` | `string` |
| `signal?` | `AbortSignal` |
| `logger?` | ``null`` \| [`Logger`](Logger.md) |

#### Returns

`Promise`\<``null`` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Inherited from

[Downloader](Downloader.md).[getCampaign](Downloader.md#getcampaign)

#### Defined in

[src/downloaders/Downloader.ts:199](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L199)

___

### getInstance

▸ **getInstance**(`url`, `options?`): `Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `options?` | [`DownloaderOptions`](../interfaces/DownloaderOptions.md) |

#### Returns

`Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

#### Inherited from

[Downloader](Downloader.md).[getInstance](Downloader.md#getinstance)

#### Defined in

[src/downloaders/Downloader.ts:184](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/downloaders/Downloader.ts#L184)
