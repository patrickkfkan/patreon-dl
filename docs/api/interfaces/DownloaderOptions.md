[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloaderOptions

# Interface: DownloaderOptions

Defined in: [src/downloaders/DownloaderOptions.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L43)

## Properties

### cookie?

> `optional` **cookie**: `string`

Defined in: [src/downloaders/DownloaderOptions.ts:44](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L44)

***

### dirNameFormat?

> `optional` **dirNameFormat**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:50](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L50)

#### campaign?

> `optional` **campaign**: `string`

#### content?

> `optional` **content**: `string`

***

### dryRun?

> `optional` **dryRun**: `boolean`

Defined in: [src/downloaders/DownloaderOptions.ts:72](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L72)

***

### embedDownloaders?

> `optional` **embedDownloaders**: [`EmbedDownloader`](EmbedDownloader.md)[]

Defined in: [src/downloaders/DownloaderOptions.ts:70](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L70)

***

### fileExistsAction?

> `optional` **fileExistsAction**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:65](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L65)

#### content?

> `optional` **content**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### info?

> `optional` **info**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### infoAPI?

> `optional` **infoAPI**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

***

### filenameFormat?

> `optional` **filenameFormat**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:54](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L54)

#### media?

> `optional` **media**: `string`

***

### include?

> `optional` **include**: [`DownloaderIncludeOptions`](DownloaderIncludeOptions.md)

Defined in: [src/downloaders/DownloaderOptions.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L57)

***

### logger?

> `optional` **logger**: `null` \| [`Logger`](../classes/Logger.md)

Defined in: [src/downloaders/DownloaderOptions.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L71)

***

### outDir?

> `optional` **outDir**: `string`

Defined in: [src/downloaders/DownloaderOptions.ts:49](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L49)

***

### pathToFFmpeg?

> `optional` **pathToFFmpeg**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L47)

***

### pathToYouTubeCredentials?

> `optional` **pathToYouTubeCredentials**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:48](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L48)

***

### request?

> `optional` **request**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:58](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L58)

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

Defined in: [src/downloaders/DownloaderOptions.ts:46](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L46)

***

### useStatusCache?

> `optional` **useStatusCache**: `boolean`

Defined in: [src/downloaders/DownloaderOptions.ts:45](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/DownloaderOptions.ts#L45)
