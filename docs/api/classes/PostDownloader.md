[patreon-dl](../README.md) / PostDownloader

# Class: PostDownloader

## Hierarchy

- [`Downloader`](Downloader.md)\<[`Post`](../interfaces/Post.md)\>

  ↳ **`PostDownloader`**

## Table of contents

### Constructors

- [constructor](PostDownloader.md#constructor)

### Properties

- [name](PostDownloader.md#name)
- [version](PostDownloader.md#version)

### Methods

- [\_\_getCampaign](PostDownloader.md#__getcampaign)
- [emit](PostDownloader.md#emit)
- [getConfig](PostDownloader.md#getconfig)
- [off](PostDownloader.md#off)
- [on](PostDownloader.md#on)
- [once](PostDownloader.md#once)
- [start](PostDownloader.md#start)
- [getCampaign](PostDownloader.md#getcampaign)
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

[src/downloaders/Downloader.ts:50](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L50)

## Properties

### name

• **name**: `string` = `'PostDownloader'`

#### Overrides

[Downloader](Downloader.md).[name](Downloader.md#name)

#### Defined in

[src/downloaders/PostDownloader.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/PostDownloader.ts#L20)

___

### version

▪ `Static` **version**: `string` = `'1.1.1'`

#### Defined in

[src/downloaders/PostDownloader.ts:18](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/PostDownloader.ts#L18)

## Methods

### \_\_getCampaign

▸ **__getCampaign**(`signal?`): `Promise`\<``null`` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `signal?` | `AbortSignal` |

#### Returns

`Promise`\<``null`` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Defined in

[src/downloaders/PostDownloader.ts:525](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/PostDownloader.ts#L525)

___

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

[src/downloaders/Downloader.ts:456](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L456)

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
| `postFetch` | \{ readonly type: "single"; readonly postId: string; } \| \{ readonly type: "byUser"; readonly vanity: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } \| \{ readonly type: "byUserId"; readonly userId: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } \| \{ readonly type: "byCollection"; readonly collectionId: string; readonly filters?: \{ readonly [x: string]: any; } \| undefined; } |
| `request` | \{ readonly maxRetries: number; readonly maxConcurrent: number; readonly minTime: number; } |
| `targetURL` | `string` |
| `useStatusCache` | `boolean` |

#### Inherited from

[Downloader](Downloader.md).[getConfig](Downloader.md#getconfig)

#### Defined in

[src/downloaders/Downloader.ts:382](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L382)

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

[src/downloaders/Downloader.ts:451](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L451)

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

[src/downloaders/Downloader.ts:441](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L441)

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

[src/downloaders/Downloader.ts:446](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L446)

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

[src/downloaders/PostDownloader.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/PostDownloader.ts#L24)

___

### getCampaign

▸ **getCampaign**(`creator`, `signal?`, `logger?`): `Promise`\<``null`` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `creator` | `string` \| [`UserIdOrVanityParam`](../README.md#useridorvanityparam) |
| `signal?` | `AbortSignal` |
| `logger?` | ``null`` \| [`Logger`](Logger.md) |

#### Returns

`Promise`\<``null`` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Inherited from

[Downloader](Downloader.md).[getCampaign](Downloader.md#getcampaign)

#### Defined in

[src/downloaders/Downloader.ts:200](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L200)

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

[src/downloaders/Downloader.ts:185](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/Downloader.ts#L185)
