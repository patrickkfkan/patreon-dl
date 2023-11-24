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
- [request](DownloaderOptions.md#request)
- [useStatusCache](DownloaderOptions.md#usestatuscache)

## Properties

### cookie

• `Optional` **cookie**: `string`

#### Defined in

src/downloaders/DownloaderOptions.ts:8

___

### dirNameFormat

• `Optional` **dirNameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `campaign?` | `string` |
| `content?` | `string` |

#### Defined in

src/downloaders/DownloaderOptions.ts:12

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

src/downloaders/DownloaderOptions.ts:32

___

### filenameFormat

• `Optional` **filenameFormat**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `media?` | `string` |

#### Defined in

src/downloaders/DownloaderOptions.ts:16

___

### include

• `Optional` **include**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `allMediaVariants?` | `boolean` |
| `campaignInfo?` | `boolean` |
| `contentInfo?` | `boolean` |
| `contentMedia?` | `boolean` |
| `lockedContent?` | `boolean` |
| `previewMedia?` | `boolean` |

#### Defined in

src/downloaders/DownloaderOptions.ts:19

___

### logger

• `Optional` **logger**: ``null`` \| [`Logger`](../classes/Logger.md)

#### Defined in

src/downloaders/DownloaderOptions.ts:37

___

### outDir

• `Optional` **outDir**: `string`

#### Defined in

src/downloaders/DownloaderOptions.ts:11

___

### pathToFFmpeg

• `Optional` **pathToFFmpeg**: ``null`` \| `string`

#### Defined in

src/downloaders/DownloaderOptions.ts:10

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

src/downloaders/DownloaderOptions.ts:27

___

### useStatusCache

• `Optional` **useStatusCache**: `boolean`

#### Defined in

src/downloaders/DownloaderOptions.ts:9
