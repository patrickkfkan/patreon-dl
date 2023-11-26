[patreon-dl](../README.md) / ProductDownloader

# Class: ProductDownloader

## Hierarchy

- [`Downloader`](Downloader.md)\<``"product"``\>

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

[src/downloaders/Downloader.ts:49](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L49)

## Properties

### name

• **name**: `string` = `'ProductDownloader'`

#### Overrides

[Downloader](Downloader.md).[name](Downloader.md#name)

#### Defined in

[src/downloaders/ProductDownloader.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/ProductDownloader.ts#L15)

___

### version

▪ `Static` **version**: `string` = `'1.0.0'`

#### Defined in

[src/downloaders/ProductDownloader.ts:13](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/ProductDownloader.ts#L13)

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

[src/downloaders/Downloader.ts:438](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L438)

___

### getConfig

▸ **getConfig**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `dirNameFormat` | \{ readonly campaign: string; readonly content: string; } |
| `fileExistsAction` | \{ readonly content: "overwrite" \| "skip" \| "saveAsCopy" \| "saveAsCopyIfNewer"; readonly info: "overwrite" \| "skip" \| "saveAsCopy" \| "saveAsCopyIfNewer"; readonly infoAPI: "overwrite" \| "skip" \| "saveAsCopy" \| "saveAsCopyIfNewer"; } |
| `filenameFormat` | \{ readonly media: string; } |
| `include` | \{ readonly lockedContent: boolean; readonly campaignInfo: boolean; readonly contentInfo: boolean; readonly previewMedia: boolean; readonly contentMedia: boolean; readonly allMediaVariants: boolean; } |
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

[src/downloaders/Downloader.ts:364](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L364)

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

[src/downloaders/Downloader.ts:433](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L433)

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

[src/downloaders/Downloader.ts:423](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L423)

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

[src/downloaders/Downloader.ts:428](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L428)

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

[src/downloaders/ProductDownloader.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/ProductDownloader.ts#L19)

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

[src/downloaders/Downloader.ts:184](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L184)
