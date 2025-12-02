[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloaderOptions

# Interface: DownloaderOptions

Defined in: [src/downloaders/DownloaderOptions.ts:59](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L59)

## Properties

### cookie?

> `optional` **cookie**: `string`

Defined in: [src/downloaders/DownloaderOptions.ts:60](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L60)

***

### dirNameFormat?

> `optional` **dirNameFormat**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:67](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L67)

#### campaign?

> `optional` **campaign**: `string`

#### content?

> `optional` **content**: `string`

***

### dryRun?

> `optional` **dryRun**: `boolean`

Defined in: [src/downloaders/DownloaderOptions.ts:90](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L90)

***

### embedDownloaders?

> `optional` **embedDownloaders**: [`EmbedDownloader`](EmbedDownloader.md)[]

Defined in: [src/downloaders/DownloaderOptions.ts:87](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L87)

***

### fileExistsAction?

> `optional` **fileExistsAction**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:82](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L82)

#### content?

> `optional` **content**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### info?

> `optional` **info**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### infoAPI?

> `optional` **infoAPI**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

***

### filenameFormat?

> `optional` **filenameFormat**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L71)

#### media?

> `optional` **media**: `string`

***

### include?

> `optional` **include**: [`DownloaderIncludeOptions`](DownloaderIncludeOptions.md)

Defined in: [src/downloaders/DownloaderOptions.ts:74](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L74)

***

### logger?

> `optional` **logger**: `null` \| [`Logger`](../classes/Logger.md)

Defined in: [src/downloaders/DownloaderOptions.ts:89](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L89)

***

### maxVideoResolution?

> `optional` **maxVideoResolution**: `null` \| `number`

Defined in: [src/downloaders/DownloaderOptions.ts:88](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L88)

***

### outDir?

> `optional` **outDir**: `string`

Defined in: [src/downloaders/DownloaderOptions.ts:66](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L66)

***

### pathToDeno?

> `optional` **pathToDeno**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:65](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L65)

***

### pathToFFmpeg?

> `optional` **pathToFFmpeg**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:63](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L63)

***

### pathToYouTubeCredentials?

> `optional` **pathToYouTubeCredentials**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:64](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L64)

***

### request?

> `optional` **request**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:75](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L75)

#### maxConcurrent?

> `optional` **maxConcurrent**: `number`

#### maxRetries?

> `optional` **maxRetries**: `number`

#### minTime?

> `optional` **minTime**: `number`

#### proxy?

> `optional` **proxy**: `null` \| [`ProxyOptions`](ProxyOptions.md)

#### userAgent?

> `optional` **userAgent**: `string`

***

### stopOn?

> `optional` **stopOn**: [`StopOnCondition`](../type-aliases/StopOnCondition.md)

Defined in: [src/downloaders/DownloaderOptions.ts:62](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L62)

***

### useStatusCache?

> `optional` **useStatusCache**: `boolean`

Defined in: [src/downloaders/DownloaderOptions.ts:61](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L61)
