[patreon-dl](../README.md) / DownloaderOptions

# Interface: DownloaderOptions

## Table of contents

### Properties

- [cookie](DownloaderOptions.md#cookie)
- [dirNameFormat](DownloaderOptions.md#dirnameformat)
- [fileExistsAction](DownloaderOptions.md#fileexistsaction)
- [filenameFormat](DownloaderOptions.md#filenameformat)
- [include](DownloaderOptions.md#include)
- [logger](DownloaderOptions.md#logger)
- [outDir](DownloaderOptions.md#outdir)
- [pathToFFmpeg](DownloaderOptions.md#pathtoffmpeg)
- [pathToYouTubeCredentials](DownloaderOptions.md#pathtoyoutubecredentials)
- [request](DownloaderOptions.md#request)
- [useStatusCache](DownloaderOptions.md#usestatuscache)

## Properties

### cookie

• `Optional` **cookie**: `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:8](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L8)

___

### dirNameFormat

• `Optional` **dirNameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `campaign?` | `string` |
| `content?` | `string` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:13](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L13)

___

### fileExistsAction

• `Optional` **fileExistsAction**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content?` | [`FileExistsAction`](../README.md#fileexistsaction) |
| `info?` | [`FileExistsAction`](../README.md#fileexistsaction) |
| `infoAPI?` | [`FileExistsAction`](../README.md#fileexistsaction) |

#### Defined in

[src/downloaders/DownloaderOptions.ts:34](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L34)

___

### filenameFormat

• `Optional` **filenameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `media?` | `string` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L17)

___

### include

• `Optional` **include**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `allMediaVariants?` | `boolean` |
| `campaignInfo?` | `boolean` |
| `contentInfo?` | `boolean` |
| `contentMedia?` | `boolean` \| (``"attachment"`` \| ``"file"`` \| ``"audio"`` \| ``"video"`` \| ``"image"``)[] |
| `lockedContent?` | `boolean` |
| `postsWithMediaType?` | ``"none"`` \| ``"any"`` \| (``"attachment"`` \| ``"audio"`` \| ``"video"`` \| ``"image"``)[] |
| `previewMedia?` | `boolean` \| (``"audio"`` \| ``"video"`` \| ``"image"``)[] |

#### Defined in

[src/downloaders/DownloaderOptions.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L20)

___

### logger

• `Optional` **logger**: ``null`` \| [`Logger`](../classes/Logger.md)

#### Defined in

[src/downloaders/DownloaderOptions.ts:39](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L39)

___

### outDir

• `Optional` **outDir**: `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L12)

___

### pathToFFmpeg

• `Optional` **pathToFFmpeg**: ``null`` \| `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:10](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L10)

___

### pathToYouTubeCredentials

• `Optional` **pathToYouTubeCredentials**: ``null`` \| `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:11](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L11)

___

### request

• `Optional` **request**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `maxConcurrent?` | `number` |
| `maxRetries?` | `number` |
| `minTime?` | `number` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L29)

___

### useStatusCache

• `Optional` **useStatusCache**: `boolean`

#### Defined in

[src/downloaders/DownloaderOptions.ts:9](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/downloaders/DownloaderOptions.ts#L9)
