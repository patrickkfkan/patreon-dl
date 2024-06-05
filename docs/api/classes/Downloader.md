[patreon-dl](../README.md) / Downloader

# Class: Downloader\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderType`](../README.md#downloadertype) |

## Hierarchy

- `EventEmitter`

  ↳ **`Downloader`**

  ↳↳ [`PostDownloader`](PostDownloader.md)

  ↳↳ [`ProductDownloader`](ProductDownloader.md)

## Table of contents

### Constructors

- [constructor](Downloader.md#constructor)

### Properties

- [name](Downloader.md#name)

### Methods

- [emit](Downloader.md#emit)
- [getConfig](Downloader.md#getconfig)
- [off](Downloader.md#off)
- [on](Downloader.md#on)
- [once](Downloader.md#once)
- [start](Downloader.md#start)
- [getCampaign](Downloader.md#getcampaign)
- [getInstance](Downloader.md#getinstance)

## Constructors

### constructor

• **new Downloader**\<`T`\>(`bootstrap`, `options?`): [`Downloader`](Downloader.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderType`](../README.md#downloadertype) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `bootstrap` | [`DownloaderBootstrapData`](../README.md#downloaderbootstrapdata)\<`T`\> |
| `options?` | [`DownloaderOptions`](../interfaces/DownloaderOptions.md) |

#### Returns

[`Downloader`](Downloader.md)\<`T`\>

#### Overrides

EventEmitter.constructor

#### Defined in

[src/downloaders/Downloader.ts:52](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L52)

## Properties

### name

• `Abstract` **name**: `string`

#### Defined in

[src/downloaders/Downloader.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L43)

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

#### Overrides

EventEmitter.emit

#### Defined in

[src/downloaders/Downloader.ts:461](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L461)

___

### getConfig

▸ **getConfig**(): `DeepReadonly`\<[`DownloaderConfig`](../README.md#downloaderconfig)\<`T`\>\>

#### Returns

`DeepReadonly`\<[`DownloaderConfig`](../README.md#downloaderconfig)\<`T`\>\>

#### Defined in

[src/downloaders/Downloader.ts:387](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L387)

___

### off

▸ **off**\<`T`\>(`event`, `listener`): [`Downloader`](Downloader.md)\<`T`\>

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

[`Downloader`](Downloader.md)\<`T`\>

#### Overrides

EventEmitter.off

#### Defined in

[src/downloaders/Downloader.ts:456](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L456)

___

### on

▸ **on**\<`T`\>(`event`, `listener`): [`Downloader`](Downloader.md)\<`T`\>

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

[`Downloader`](Downloader.md)\<`T`\>

#### Overrides

EventEmitter.on

#### Defined in

[src/downloaders/Downloader.ts:446](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L446)

___

### once

▸ **once**\<`T`\>(`event`, `listener`): [`Downloader`](Downloader.md)\<`T`\>

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

[`Downloader`](Downloader.md)\<`T`\>

#### Overrides

EventEmitter.once

#### Defined in

[src/downloaders/Downloader.ts:451](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L451)

___

### start

▸ **start**(`params`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`DownloaderStartParams`](../interfaces/DownloaderStartParams.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/downloaders/Downloader.ts:188](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L188)

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

#### Defined in

[src/downloaders/Downloader.ts:205](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L205)

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

#### Defined in

[src/downloaders/Downloader.ts:190](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/Downloader.ts#L190)
