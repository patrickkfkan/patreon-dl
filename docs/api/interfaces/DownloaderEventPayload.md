[patreon-dl](../README.md) / DownloaderEventPayload

# Interface: DownloaderEventPayload

## Table of contents

### Properties

- [end](DownloaderEventPayload.md#end)
- [fetchBegin](DownloaderEventPayload.md#fetchbegin)
- [phaseBegin](DownloaderEventPayload.md#phasebegin)
- [phaseEnd](DownloaderEventPayload.md#phaseend)
- [targetBegin](DownloaderEventPayload.md#targetbegin)
- [targetEnd](DownloaderEventPayload.md#targetend)

## Properties

### end

• **end**: \{ `aborted`: ``true`` ; `error?`: `undefined` ; `message`: `string`  } \| \{ `aborted`: ``false`` ; `error?`: `any` ; `message`: `string`  }

#### Defined in

[src/downloaders/DownloaderEvent.ts:56](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderEvent.ts#L56)

___

### fetchBegin

• **fetchBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `targetType` | ``"post"`` \| ``"product"`` \| ``"posts"`` |

#### Defined in

[src/downloaders/DownloaderEvent.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderEvent.ts#L24)

___

### phaseBegin

• **phaseBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phase` | ``"saveInfo"`` \| ``"saveMedia"`` \| ``"batchDownload"`` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderEvent.ts#L42)

___

### phaseEnd

• **phaseEnd**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phase` | ``"saveInfo"`` \| ``"saveMedia"`` \| ``"batchDownload"`` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:51](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderEvent.ts#L51)

___

### targetBegin

• **targetBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderEvent.ts#L28)

___

### targetEnd

• **targetEnd**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isSkipped` | `boolean` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:32](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderEvent.ts#L32)
