[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / DownloaderEventPayload

# Interface: DownloaderEventPayload

## Properties

### end

> **end**: `object` \| `object`

#### Defined in

[src/downloaders/DownloaderEvent.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/DownloaderEvent.ts#L57)

***

### fetchBegin

> **fetchBegin**: `object`

#### targetType

> **targetType**: `"product"` \| `"post"` \| `"posts"`

#### Defined in

[src/downloaders/DownloaderEvent.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/DownloaderEvent.ts#L25)

***

### phaseBegin

> **phaseBegin**: `object` & `object` \| `object`

#### Type declaration

##### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/DownloaderEvent.ts#L43)

***

### phaseEnd

> **phaseEnd**: `object`

#### phase

> **phase**: `"saveInfo"` \| `"saveMedia"` \| `"batchDownload"`

#### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:52](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/DownloaderEvent.ts#L52)

***

### targetBegin

> **targetBegin**: `object`

#### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/DownloaderEvent.ts#L29)

***

### targetEnd

> **targetEnd**: `object` & `object` \| `object`

#### Type declaration

##### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/DownloaderEvent.ts#L33)
