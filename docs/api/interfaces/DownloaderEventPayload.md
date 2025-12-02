[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloaderEventPayload

# Interface: DownloaderEventPayload

Defined in: [src/downloaders/DownloaderEvent.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L23)

## Properties

### end

> **end**: \{ `aborted`: `true`; `error?`: `undefined`; `message`: `string`; \} \| \{ `aborted`: `false`; `error?`: `any`; `message`: `string`; \}

Defined in: [src/downloaders/DownloaderEvent.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L57)

***

### fetchBegin

> **fetchBegin**: `object`

Defined in: [src/downloaders/DownloaderEvent.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L25)

#### targetType

> **targetType**: `"product"` \| `"post"` \| `"posts"` \| `"products"`

***

### phaseBegin

> **phaseBegin**: `object` & \{ `phase`: `"saveInfo"` \| `"saveMedia"`; \} \| \{ `batch`: [`IDownloadTaskBatch`](IDownloadTaskBatch.md); `phase`: `"batchDownload"`; \}

Defined in: [src/downloaders/DownloaderEvent.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L43)

#### Type declaration

##### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Collection`](Collection.md) \| [`Product`](Product.md)

***

### phaseEnd

> **phaseEnd**: `object`

Defined in: [src/downloaders/DownloaderEvent.ts:52](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L52)

#### phase

> **phase**: `"saveInfo"` \| `"saveMedia"` \| `"batchDownload"`

#### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Collection`](Collection.md) \| [`Product`](Product.md)

***

### targetBegin

> **targetBegin**: `object`

Defined in: [src/downloaders/DownloaderEvent.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L29)

#### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Collection`](Collection.md) \| [`Product`](Product.md)

***

### targetEnd

> **targetEnd**: `object` & \{ `isSkipped`: `false`; \} \| \{ `isSkipped`: `true`; `skipMessage`: `string`; `skipReason`: [`TargetSkipReason`](../enumerations/TargetSkipReason.md); \}

Defined in: [src/downloaders/DownloaderEvent.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderEvent.ts#L33)

#### Type declaration

##### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Collection`](Collection.md) \| [`Product`](Product.md)
