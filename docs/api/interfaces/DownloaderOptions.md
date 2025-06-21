[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloaderOptions

# Interface: DownloaderOptions

Defined in: [src/downloaders/DownloaderOptions.ts:40](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L40)

## Properties

### cookie?

> `optional` **cookie**: `string`

Defined in: [src/downloaders/DownloaderOptions.ts:41](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L41)

***

### dirNameFormat?

> `optional` **dirNameFormat**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L47)

#### campaign?

> `optional` **campaign**: `string`

#### content?

> `optional` **content**: `string`

***

### dryRun?

> `optional` **dryRun**: `boolean`

Defined in: [src/downloaders/DownloaderOptions.ts:68](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L68)

***

### embedDownloaders?

> `optional` **embedDownloaders**: [`EmbedDownloader`](EmbedDownloader.md)[]

Defined in: [src/downloaders/DownloaderOptions.ts:66](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L66)

***

### fileExistsAction?

> `optional` **fileExistsAction**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:61](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L61)

#### content?

> `optional` **content**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### info?

> `optional` **info**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### infoAPI?

> `optional` **infoAPI**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

***

### filenameFormat?

> `optional` **filenameFormat**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:51](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L51)

#### media?

> `optional` **media**: `string`

***

### include?

> `optional` **include**: [`DownloaderIncludeOptions`](DownloaderIncludeOptions.md)

Defined in: [src/downloaders/DownloaderOptions.ts:54](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L54)

***

### logger?

> `optional` **logger**: `null` \| [`Logger`](../classes/Logger.md)

Defined in: [src/downloaders/DownloaderOptions.ts:67](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L67)

***

### outDir?

> `optional` **outDir**: `string`

Defined in: [src/downloaders/DownloaderOptions.ts:46](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L46)

***

### pathToFFmpeg?

> `optional` **pathToFFmpeg**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:44](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L44)

***

### pathToYouTubeCredentials?

> `optional` **pathToYouTubeCredentials**: `null` \| `string`

Defined in: [src/downloaders/DownloaderOptions.ts:45](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L45)

***

### request?

> `optional` **request**: `object`

Defined in: [src/downloaders/DownloaderOptions.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L55)

#### maxConcurrent?

> `optional` **maxConcurrent**: `number`

#### maxRetries?

> `optional` **maxRetries**: `number`

#### minTime?

> `optional` **minTime**: `number`

#### proxy?

> `optional` **proxy**: `null` \| [`ProxyOptions`](ProxyOptions.md)

***

### stopOn?

> `optional` **stopOn**: [`StopOnCondition`](../type-aliases/StopOnCondition.md)

Defined in: [src/downloaders/DownloaderOptions.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L43)

***

### useStatusCache?

> `optional` **useStatusCache**: `boolean`

Defined in: [src/downloaders/DownloaderOptions.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/DownloaderOptions.ts#L42)
