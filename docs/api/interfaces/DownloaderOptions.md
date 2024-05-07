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

[src/downloaders/DownloaderOptions.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L19)

___

### dirNameFormat

• `Optional` **dirNameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `campaign?` | `string` |
| `content?` | `string` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L24)

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

[src/downloaders/DownloaderOptions.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L37)

___

### filenameFormat

• `Optional` **filenameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `media?` | `string` |

#### Defined in

[src/downloaders/DownloaderOptions.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L28)

___

### include

• `Optional` **include**: [`DownloaderIncludeOptions`](DownloaderIncludeOptions.md)

#### Defined in

[src/downloaders/DownloaderOptions.ts:31](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L31)

___

### logger

• `Optional` **logger**: ``null`` \| [`Logger`](../classes/Logger.md)

#### Defined in

[src/downloaders/DownloaderOptions.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L42)

___

### outDir

• `Optional` **outDir**: `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L23)

___

### pathToFFmpeg

• `Optional` **pathToFFmpeg**: ``null`` \| `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L21)

___

### pathToYouTubeCredentials

• `Optional` **pathToYouTubeCredentials**: ``null`` \| `string`

#### Defined in

[src/downloaders/DownloaderOptions.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L22)

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

[src/downloaders/DownloaderOptions.ts:32](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L32)

___

### useStatusCache

• `Optional` **useStatusCache**: `boolean`

#### Defined in

[src/downloaders/DownloaderOptions.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/downloaders/DownloaderOptions.ts#L20)
