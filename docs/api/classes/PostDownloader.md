[patreon-dl](../README.md) / PostDownloader

# Class: PostDownloader

## Hierarchy

- [`Downloader`](Downloader.md)\<``"post"``\>

  ↳ **`PostDownloader`**

## Table of contents

### Constructors

- [constructor](PostDownloader.md#constructor)

### Properties

- [name](PostDownloader.md#name)
- [version](PostDownloader.md#version)

### Methods

- [emit](PostDownloader.md#emit)
- [getConfig](PostDownloader.md#getconfig)
- [off](PostDownloader.md#off)
- [on](PostDownloader.md#on)
- [once](PostDownloader.md#once)
- [start](PostDownloader.md#start)
- [getInstance](PostDownloader.md#getinstance)

## Constructors

### constructor

• **new PostDownloader**(`bootstrap`, `options?`): [`PostDownloader`](PostDownloader.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `bootstrap` | [`PostDownloaderBootstrapData`](../interfaces/PostDownloaderBootstrapData.md) |
| `options?` | [`DownloaderOptions`](../interfaces/DownloaderOptions.md) |

#### Returns

[`PostDownloader`](PostDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[constructor](Downloader.md#constructor)

#### Defined in

[src/downloaders/Downloader.ts:49](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L49)

## Properties

### name

• **name**: `string` = `'PostDownloader'`

#### Overrides

[Downloader](Downloader.md).[name](Downloader.md#name)

#### Defined in

[src/downloaders/PostDownloader.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/PostDownloader.ts#L20)

___

### version

▪ `Static` **version**: `string` = `'1.1.0'`

#### Defined in

[src/downloaders/PostDownloader.ts:18](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/PostDownloader.ts#L18)

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
| `postFetch` | \{ readonly type: "single"; readonly postId: string; } \| \{ readonly type: "byUser"; readonly vanity: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } \| \{ readonly type: "byCollection"; readonly collectionId: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } |
| `request` | \{ readonly maxRetries: number; readonly maxConcurrent: number; readonly minTime: number; } |
| `targetURL` | `string` |
| `useStatusCache` | `boolean` |

#### Inherited from

[Downloader](Downloader.md).[getConfig](Downloader.md#getconfig)

#### Defined in

[src/downloaders/Downloader.ts:364](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L364)

___

### off

▸ **off**\<`T`\>(`event`, `listener`): [`PostDownloader`](PostDownloader.md)

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

[`PostDownloader`](PostDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[off](Downloader.md#off)

#### Defined in

[src/downloaders/Downloader.ts:433](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L433)

___

### on

▸ **on**\<`T`\>(`event`, `listener`): [`PostDownloader`](PostDownloader.md)

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

[`PostDownloader`](PostDownloader.md)

#### Inherited from

[Downloader](Downloader.md).[on](Downloader.md#on)

#### Defined in

[src/downloaders/Downloader.ts:423](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Downloader.ts#L423)

___

### once

▸ **once**\<`T`\>(`event`, `listener`): [`PostDownloader`](PostDownloader.md)

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

[`PostDownloader`](PostDownloader.md)

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

[src/downloaders/PostDownloader.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/PostDownloader.ts#L24)

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
