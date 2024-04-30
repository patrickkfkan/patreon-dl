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

[src/downloaders/DownloaderEvent.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L55)

___

### fetchBegin

• **fetchBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `targetType` | ``"post"`` \| ``"product"`` \| ``"posts"`` |

#### Defined in

[src/downloaders/DownloaderEvent.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L23)

___

### phaseBegin

• **phaseBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phase` | ``"saveInfo"`` \| ``"saveMedia"`` \| ``"batchDownload"`` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:41](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L41)

___

### phaseEnd

• **phaseEnd**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `phase` | ``"saveInfo"`` \| ``"saveMedia"`` \| ``"batchDownload"`` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:50](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L50)

___

### targetBegin

• **targetBegin**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L27)

___

### targetEnd

• **targetEnd**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isSkipped` | `boolean` |
| `target` | [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:31](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L31)
