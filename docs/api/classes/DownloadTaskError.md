[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloadTaskError

# Class: DownloadTaskError

Defined in: [src/downloaders/task/DownloadTask.ts:13](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/task/DownloadTask.ts#L13)

## Extends

- `Error`

## Constructors

### Constructor

> **new DownloadTaskError**(`message`, `task`, `cause?`): `DownloadTaskError`

Defined in: [src/downloaders/task/DownloadTask.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/task/DownloadTask.ts#L17)

#### Parameters

##### message

`string`

##### task

[`IDownloadTask`](../interfaces/IDownloadTask.md)

##### cause?

`Error`

#### Returns

`DownloadTaskError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `Error`

Defined in: [src/downloaders/task/DownloadTask.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/task/DownloadTask.ts#L15)

#### Overrides

`Error.cause`

***

### task

> **task**: [`IDownloadTask`](../interfaces/IDownloadTask.md)

Defined in: [src/downloaders/task/DownloadTask.ts:14](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/downloaders/task/DownloadTask.ts#L14)
