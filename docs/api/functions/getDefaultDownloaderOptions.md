[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / getDefaultDownloaderOptions

# Function: getDefaultDownloaderOptions()

> **getDefaultDownloaderOptions**(): `object`

Defined in: [src/downloaders/DownloaderOptions.ts:246](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/DownloaderOptions.ts#L246)

## Returns

`object`

### cookie

> **cookie**: `string`

### dirNameFormat

> **dirNameFormat**: `object`

#### dirNameFormat.campaign

> **campaign**: `string`

#### dirNameFormat.content

> **content**: `string`

### dryRun

> **dryRun**: `boolean`

### embedDownloaders

> **embedDownloaders**: `object`[]

### fileExistsAction

> **fileExistsAction**: `object`

#### fileExistsAction.content

> **content**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### fileExistsAction.info

> **info**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

#### fileExistsAction.infoAPI

> **infoAPI**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

### filenameFormat

> **filenameFormat**: `object`

#### filenameFormat.media

> **media**: `string`

### include

> **include**: `object`

#### include.allMediaVariants

> **allMediaVariants**: `boolean`

#### include.campaignInfo

> **campaignInfo**: `boolean`

#### include.comments

> **comments**: `boolean`

#### include.contentInfo

> **contentInfo**: `boolean`

#### include.contentMedia

> **contentMedia**: `boolean` \| (`"attachment"` \| `"file"` \| `"audio"` \| `"video"` \| `"image"`)[]

#### include.lockedContent

> **lockedContent**: `boolean`

#### include.mediaByFilename

> **mediaByFilename**: `object`

#### include.mediaByFilename.attachments

> **attachments**: `null` \| `string`

#### include.mediaByFilename.audio

> **audio**: `null` \| `string`

#### include.mediaByFilename.images

> **images**: `null` \| `string`

#### include.mediaThumbnails

> **mediaThumbnails**: `boolean`

#### include.postsInTier

> **postsInTier**: `"any"` \| `string`[]

#### include.postsPublished

> **postsPublished**: `object`

#### include.postsPublished.after

> **after**: `null` \| [`DateTime`](../classes/DateTime.md)

#### include.postsPublished.before

> **before**: `null` \| [`DateTime`](../classes/DateTime.md)

#### include.postsWithMediaType

> **postsWithMediaType**: `"none"` \| `"any"` \| (`"attachment"` \| `"audio"` \| `"video"` \| `"image"` \| `"podcast"`)[]

#### include.previewMedia

> **previewMedia**: `boolean` \| (`"audio"` \| `"video"` \| `"image"`)[]

#### include.productsPublished

> **productsPublished**: `object`

#### include.productsPublished.after

> **after**: `null` \| [`DateTime`](../classes/DateTime.md)

#### include.productsPublished.before

> **before**: `null` \| [`DateTime`](../classes/DateTime.md)

### logger

> **logger**: `null` \| \{ `end`: \{ \}; `log`: \{ \}; \}

### maxVideoResolution

> **maxVideoResolution**: `null` \| `number`

### outDir

> **outDir**: `string`

### pathToDeno

> **pathToDeno**: `null` \| `string`

### pathToFFmpeg

> **pathToFFmpeg**: `null` \| `string`

### pathToYouTubeCredentials

> **pathToYouTubeCredentials**: `null` \| `string`

### request

> **request**: `object`

#### request.maxConcurrent

> **maxConcurrent**: `number`

#### request.maxRetries

> **maxRetries**: `number`

#### request.minTime

> **minTime**: `number`

#### request.proxy

> **proxy**: `null` \| \{ `rejectUnauthorizedTLS`: `boolean`; `url`: `string`; \}

#### request.userAgent

> **userAgent**: `string`

### stopOn

> **stopOn**: [`StopOnCondition`](../type-aliases/StopOnCondition.md)

### useStatusCache

> **useStatusCache**: `boolean`
