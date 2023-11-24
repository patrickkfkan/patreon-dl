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

src/downloaders/Downloader.ts:48

## Properties

### name

• **name**: `string` = `'PostDownloader'`

#### Overrides

[Downloader](Downloader.md).[name](Downloader.md#name)

#### Defined in

src/downloaders/PostDownloader.ts:20

___

### version

▪ `Static` **version**: `string` = `'1.0.0'`

#### Defined in

src/downloaders/PostDownloader.ts:18

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

src/downloaders/Downloader.ts:426

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
| `postFetch` | \{ readonly type: "single"; readonly postId: string; } \| \{ readonly type: "byUser"; readonly vanity: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } \| \{ readonly type: "byCollection"; readonly collectionId: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } |
| `request` | \{ readonly maxRetries: number; readonly maxConcurrent: number; readonly minTime: number; } |
| `targetURL` | `string` |
| `useStatusCache` | `boolean` |

#### Inherited from

[Downloader](Downloader.md).[getConfig](Downloader.md#getconfig)

#### Defined in

src/downloaders/Downloader.ts:352

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

src/downloaders/Downloader.ts:421

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

src/downloaders/Downloader.ts:411

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

src/downloaders/Downloader.ts:416

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

src/downloaders/PostDownloader.ts:24

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

src/downloaders/Downloader.ts:174
