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

• **end**: \{ `aborted`: ``true`` ; `error?`: `undefined`  } \| \{ `aborted`: ``false`` ; `error?`: `any`  }

#### Defined in

[src/downloaders/DownloaderEvent.ts:54](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/DownloaderEvent.ts#L54)

___

### fetchBegin

• **fetchBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `targetType` | ``"product"`` \| ``"post"`` \| ``"posts"`` |

#### Defined in

[src/downloaders/DownloaderEvent.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/DownloaderEvent.ts#L22)

___

### phaseBegin

• **phaseBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phase` | ``"saveInfo"`` \| ``"saveMedia"`` \| ``"batchDownload"`` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:40](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/DownloaderEvent.ts#L40)

___

### phaseEnd

• **phaseEnd**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phase` | ``"saveInfo"`` \| ``"saveMedia"`` \| ``"batchDownload"`` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:49](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/DownloaderEvent.ts#L49)

___

### targetBegin

• **targetBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/DownloaderEvent.ts#L26)

___

### targetEnd

• **targetEnd**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isSkipped` | `boolean` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:30](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/DownloaderEvent.ts#L30)
