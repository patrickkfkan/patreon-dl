[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / DownloaderEventPayload

# Interface: DownloaderEventPayload

## Properties

### end

> **end**: `object` \| `object`

#### Defined in

[src/downloaders/DownloaderEvent.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/DownloaderEvent.ts#L57)

***

### fetchBegin

> **fetchBegin**: `object`

#### targetType

> **targetType**: `"product"` \| `"post"` \| `"posts"`

#### Defined in

[src/downloaders/DownloaderEvent.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/DownloaderEvent.ts#L25)

***

### phaseBegin

> **phaseBegin**: `object` & `object` \| `object`

#### Type declaration

##### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/DownloaderEvent.ts#L43)

***

### phaseEnd

> **phaseEnd**: `object`

#### phase

> **phase**: `"saveInfo"` \| `"saveMedia"` \| `"batchDownload"`

#### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:52](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/DownloaderEvent.ts#L52)

***

### targetBegin

> **targetBegin**: `object`

#### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/DownloaderEvent.ts#L29)

***

### targetEnd

> **targetEnd**: `object` & `object` \| `object`

#### Type declaration

##### target

> **target**: [`Campaign`](Campaign.md) \| [`Post`](Post.md) \| [`Product`](Product.md)

#### Defined in

[src/downloaders/DownloaderEvent.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/DownloaderEvent.ts#L33)
