[patreon-dl](../README.md) / DownloaderOptions

# Interface: DownloaderOptions

## Table of contents

### Properties

- [cookie](DownloaderOptions.md#cookie)
- [dirNameFormat](DownloaderOptions.md#dirnameformat)
- [embedDownloaders](DownloaderOptions.md#embeddownloaders)
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

[src/downloaders/DownloaderOptions.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L24)

___

### dirNameFormat

• `Optional` **dirNameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `campaign?` | `string` |
| `content?` | `string` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L29)

___

### embedDownloaders

• `Optional` **embedDownloaders**: [`EmbedDownloader`](EmbedDownloader.md)[]

#### Defined in

[src/downloaders/DownloaderOptions.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L47)

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

[src/downloaders/DownloaderOptions.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L42)

___

### filenameFormat

• `Optional` **filenameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `media?` | `string` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L33)

___

### include

• `Optional` **include**: [`DownloaderIncludeOptions`](DownloaderIncludeOptions.md)

#### Defined in

[src/downloaders/DownloaderOptions.ts:36](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L36)

___

### logger

• `Optional` **logger**: ``null`` \| [`Logger`](../classes/Logger.md)

#### Defined in

[src/downloaders/DownloaderOptions.ts:48](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L48)

___

### outDir

• `Optional` **outDir**: `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L28)

___

### pathToFFmpeg

• `Optional` **pathToFFmpeg**: ``null`` \| `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L26)

___

### pathToYouTubeCredentials

• `Optional` **pathToYouTubeCredentials**: ``null`` \| `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L27)

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

[src/downloaders/DownloaderOptions.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L37)

___

### useStatusCache

• `Optional` **useStatusCache**: `boolean`

#### Defined in

[src/downloaders/DownloaderOptions.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/downloaders/DownloaderOptions.ts#L25)
