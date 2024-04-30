patreon-dl

# patreon-dl

## Table of contents

### Enumerations

- [TargetSkipReason](enums/TargetSkipReason.md)

### Classes

- [ChainLogger](classes/ChainLogger.md)
- [ConsoleLogger](classes/ConsoleLogger.md)
- [DownloadTaskError](classes/DownloadTaskError.md)
- [Downloader](classes/Downloader.md)
- [FileLogger](classes/FileLogger.md)
- [Logger](classes/Logger.md)
- [PostDownloader](classes/PostDownloader.md)
- [ProductDownloader](classes/ProductDownloader.md)
- [YouTubeCredentialsCapturer](classes/YouTubeCredentialsCapturer.md)

### Interfaces

- [Attachment](interfaces/Attachment.md)
- [AudioMediaItem](interfaces/AudioMediaItem.md)
- [BootstrapData](interfaces/BootstrapData.md)
- [Campaign](interfaces/Campaign.md)
- [CampaignCoverPhotoMediaItem](interfaces/CampaignCoverPhotoMediaItem.md)
- [ConsoleLoggerOptions](interfaces/ConsoleLoggerOptions.md)
- [DefaultImageMediaItem](interfaces/DefaultImageMediaItem.md)
- [DownloadProgress](interfaces/DownloadProgress.md)
- [DownloadTaskBatchEventPayload](interfaces/DownloadTaskBatchEventPayload.md)
- [DownloaderEventPayload](interfaces/DownloaderEventPayload.md)
- [DownloaderOptions](interfaces/DownloaderOptions.md)
- [DownloaderStartParams](interfaces/DownloaderStartParams.md)
- [DummyMediaItem](interfaces/DummyMediaItem.md)
- [FileLoggerConfig](interfaces/FileLoggerConfig.md)
- [FileLoggerInit](interfaces/FileLoggerInit.md)
- [FileLoggerOptions](interfaces/FileLoggerOptions.md)
- [FileMediaItem](interfaces/FileMediaItem.md)
- [IDownloadTask](interfaces/IDownloadTask.md)
- [IDownloadTaskBatch](interfaces/IDownloadTaskBatch.md)
- [LogEntry](interfaces/LogEntry.md)
- [MediaLike](interfaces/MediaLike.md)
- [Post](interfaces/Post.md)
- [PostCoverImageMediaItem](interfaces/PostCoverImageMediaItem.md)
- [PostDownloaderBootstrapData](interfaces/PostDownloaderBootstrapData.md)
- [PostEmbed](interfaces/PostEmbed.md)
- [PostThumbnailMediaItem](interfaces/PostThumbnailMediaItem.md)
- [Product](interfaces/Product.md)
- [ProductDownloaderBootstrapData](interfaces/ProductDownloaderBootstrapData.md)
- [Reward](interfaces/Reward.md)
- [SingleImageMediaItem](interfaces/SingleImageMediaItem.md)
- [User](interfaces/User.md)
- [VideoMediaItem](interfaces/VideoMediaItem.md)
- [YouTubeCredentialsPendingInfo](interfaces/YouTubeCredentialsPendingInfo.md)

### Type Aliases

- [DeepRequired](README.md#deeprequired)
- [DownloadTaskBatchEvent](README.md#downloadtaskbatchevent)
- [DownloadTaskBatchEventPayloadOf](README.md#downloadtaskbatcheventpayloadof)
- [DownloadTaskSkipReason](README.md#downloadtaskskipreason)
- [DownloadTaskStatus](README.md#downloadtaskstatus)
- [Downloadable](README.md#downloadable)
- [DownloaderBootstrapData](README.md#downloaderbootstrapdata)
- [DownloaderConfig](README.md#downloaderconfig)
- [DownloaderEvent](README.md#downloaderevent)
- [DownloaderEventPayloadOf](README.md#downloadereventpayloadof)
- [DownloaderInit](README.md#downloaderinit)
- [DownloaderType](README.md#downloadertype)
- [FileExistsAction](README.md#fileexistsaction)
- [ImageMediaItem](README.md#imagemediaitem)
- [ImageType](README.md#imagetype)
- [LogLevel](README.md#loglevel)
- [MediaItem](README.md#mediaitem)
- [YouTubePostEmbed](README.md#youtubepostembed)

## Type Aliases

### DeepRequired

Ƭ **DeepRequired**\<`T`\>: `T` extends [infer I] ? [[`DeepRequired`](README.md#deeprequired)\<`I`\>] : `T` extends infer I[] ? [`DeepRequired`](README.md#deeprequired)\<`I`\>[] : `T` extends `object` ? \{ [P in keyof T]-?: DeepRequired\<T[P]\> } : `T` extends `undefined` ? `never` : `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[src/utils/Misc.ts:2](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/utils/Misc.ts#L2)

___

### DownloadTaskBatchEvent

Ƭ **DownloadTaskBatchEvent**: ``"taskStart"`` \| ``"taskProgress"`` \| ``"taskComplete"`` \| ``"taskError"`` \| ``"taskAbort"`` \| ``"taskSkip"`` \| ``"taskSpawn"`` \| ``"complete"``

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:3](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/task/DownloadTaskBatchEvent.ts#L3)

___

### DownloadTaskBatchEventPayloadOf

Ƭ **DownloadTaskBatchEventPayloadOf**\<`T`\>: [`DownloadTaskBatchEventPayload`](interfaces/DownloadTaskBatchEventPayload.md)[`T`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloadTaskBatchEvent`](README.md#downloadtaskbatchevent) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:50](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/task/DownloadTaskBatchEvent.ts#L50)

___

### DownloadTaskSkipReason

Ƭ **DownloadTaskSkipReason**: \{ `message`: `string`  } & \{ `existingDestFilePath`: `string` ; `name`: ``"destFileExists"``  } \| \{ `name`: ``"other"``  }

#### Defined in

[src/downloaders/task/DownloadTask.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/task/DownloadTask.ts#L17)

___

### DownloadTaskStatus

Ƭ **DownloadTaskStatus**: ``"pending"`` \| ``"pending-retry"`` \| ``"downloading"`` \| ``"error"`` \| ``"completed"`` \| ``"aborted"`` \| ``"skipped"``

#### Defined in

[src/downloaders/task/DownloadTask.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/task/DownloadTask.ts#L55)

___

### Downloadable

Ƭ **Downloadable**: [`MediaItem`](README.md#mediaitem) \| [`Attachment`](interfaces/Attachment.md) \| [`YouTubePostEmbed`](README.md#youtubepostembed)

#### Defined in

[src/entities/Downloadable.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/entities/Downloadable.ts#L5)

___

### DownloaderBootstrapData

Ƭ **DownloaderBootstrapData**\<`T`\>: `T`[``"type"``] extends ``"product"`` ? [`ProductDownloaderBootstrapData`](interfaces/ProductDownloaderBootstrapData.md) : `T`[``"type"``] extends ``"post"`` ? [`PostDownloaderBootstrapData`](interfaces/PostDownloaderBootstrapData.md) : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderType`](README.md#downloadertype) |

#### Defined in

[src/downloaders/Bootstrap.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/Bootstrap.ts#L33)

___

### DownloaderConfig

Ƭ **DownloaderConfig**\<`T`\>: [`DownloaderInit`](README.md#downloaderinit) & `Omit`\<[`DownloaderBootstrapData`](README.md#downloaderbootstrapdata)\<`T`\>, ``"type"``\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderType`](README.md#downloadertype) |

#### Defined in

[src/downloaders/Downloader.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/Downloader.ts#L24)

___

### DownloaderEvent

Ƭ **DownloaderEvent**: ``"fetchBegin"`` \| ``"targetBegin"`` \| ``"targetEnd"`` \| ``"phaseBegin"`` \| ``"phaseEnd"`` \| ``"end"``

#### Defined in

[src/downloaders/DownloaderEvent.ts:6](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L6)

___

### DownloaderEventPayloadOf

Ƭ **DownloaderEventPayloadOf**\<`T`\>: [`DownloaderEventPayload`](interfaces/DownloaderEventPayload.md)[`T`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloaderEvent`](README.md#downloaderevent) |

#### Defined in

[src/downloaders/DownloaderEvent.ts:66](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderEvent.ts#L66)

___

### DownloaderInit

Ƭ **DownloaderInit**: [`DeepRequired`](README.md#deeprequired)\<`Pick`\<[`DownloaderOptions`](interfaces/DownloaderOptions.md), ``"outDir"`` \| ``"useStatusCache"`` \| ``"pathToFFmpeg"`` \| ``"pathToYouTubeCredentials"`` \| ``"dirNameFormat"`` \| ``"filenameFormat"`` \| ``"include"`` \| ``"request"`` \| ``"fileExistsAction"``\>\>

#### Defined in

[src/downloaders/DownloaderOptions.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderOptions.ts#L42)

___

### DownloaderType

Ƭ **DownloaderType**: [`Product`](interfaces/Product.md) \| [`Post`](interfaces/Post.md)

#### Defined in

[src/downloaders/Bootstrap.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/Bootstrap.ts#L5)

___

### FileExistsAction

Ƭ **FileExistsAction**: ``"overwrite"`` \| ``"skip"`` \| ``"saveAsCopy"`` \| ``"saveAsCopyIfNewer"``

#### Defined in

[src/downloaders/DownloaderOptions.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/DownloaderOptions.ts#L5)

___

### ImageMediaItem

Ƭ **ImageMediaItem**\<`T`\>: `T` extends ``"single"`` ? [`SingleImageMediaItem`](interfaces/SingleImageMediaItem.md) : `T` extends ``"default"`` ? [`DefaultImageMediaItem`](interfaces/DefaultImageMediaItem.md) : `T` extends ``"campaignCoverPhoto"`` ? [`CampaignCoverPhotoMediaItem`](interfaces/CampaignCoverPhotoMediaItem.md) : `T` extends ``"postCoverImage"`` ? [`PostCoverImageMediaItem`](interfaces/PostCoverImageMediaItem.md) : `T` extends ``"postThumbnail"`` ? [`PostThumbnailMediaItem`](interfaces/PostThumbnailMediaItem.md) : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`ImageType`](README.md#imagetype) |

#### Defined in

[src/entities/MediaItem.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/entities/MediaItem.ts#L71)

___

### ImageType

Ƭ **ImageType**: ``"single"`` \| ``"default"`` \| ``"campaignCoverPhoto"`` \| ``"postCoverImage"`` \| ``"postThumbnail"``

#### Defined in

[src/entities/MediaItem.ts:8](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/entities/MediaItem.ts#L8)

___

### LogLevel

Ƭ **LogLevel**: ``"info"`` \| ``"debug"`` \| ``"warn"`` \| ``"error"``

#### Defined in

[src/utils/logging/Logger.ts:1](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/utils/logging/Logger.ts#L1)

___

### MediaItem

Ƭ **MediaItem**: [`ImageMediaItem`](README.md#imagemediaitem)\<`any`\> \| [`VideoMediaItem`](interfaces/VideoMediaItem.md) \| [`AudioMediaItem`](interfaces/AudioMediaItem.md) \| [`FileMediaItem`](interfaces/FileMediaItem.md) \| [`DummyMediaItem`](interfaces/DummyMediaItem.md)

#### Defined in

[src/entities/MediaItem.ts:118](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/entities/MediaItem.ts#L118)

___

### YouTubePostEmbed

Ƭ **YouTubePostEmbed**: [`PostEmbed`](interfaces/PostEmbed.md) & \{ `provider`: ``"YouTube"`` ; `type`: ``"videoEmbed"``  }

#### Defined in

[src/entities/Post.ts:101](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/entities/Post.ts#L101)
