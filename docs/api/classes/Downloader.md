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

[src/downloaders/Downloader.ts:49](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L49)

## Properties

### name

• `Abstract` **name**: `string`

#### Defined in

[src/downloaders/Downloader.ts:41](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L41)

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

[src/downloaders/Downloader.ts:440](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L440)

___

### getConfig

▸ **getConfig**(): `DeepReadonly`\<[`DownloaderConfig`](../README.md#downloaderconfig)\<`T`\>\>

#### Returns

`DeepReadonly`\<[`DownloaderConfig`](../README.md#downloaderconfig)\<`T`\>\>

#### Defined in

[src/downloaders/Downloader.ts:366](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L366)

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

[src/downloaders/Downloader.ts:435](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L435)

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

[src/downloaders/Downloader.ts:425](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L425)

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

[src/downloaders/Downloader.ts:430](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L430)

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

[src/downloaders/Downloader.ts:182](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L182)

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

[src/downloaders/Downloader.ts:184](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/downloaders/Downloader.ts#L184)
