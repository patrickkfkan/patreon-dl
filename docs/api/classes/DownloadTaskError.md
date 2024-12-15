[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / DownloadTaskError

# Class: DownloadTaskError

## Extends

- `Error`

## Constructors

### new DownloadTaskError()

> **new DownloadTaskError**(`message`, `task`, `cause`?): [`DownloadTaskError`](DownloadTaskError.md)

#### Parameters

• **message**: `string`

• **task**: [`IDownloadTask`](../interfaces/IDownloadTask.md)

• **cause?**: `Error`

#### Returns

[`DownloadTaskError`](DownloadTaskError.md)

#### Overrides

`Error.constructor`

#### Defined in

[src/downloaders/task/DownloadTask.ts:14](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/task/DownloadTask.ts#L14)

## Properties

### cause?

> `optional` **cause**: `Error`

#### Overrides

`Error.cause`

#### Defined in

[src/downloaders/task/DownloadTask.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/task/DownloadTask.ts#L12)

***

### task

> **task**: [`IDownloadTask`](../interfaces/IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTask.ts:11](https://github.com/patrickkfkan/patreon-dl/blob/29c94231b23a7a4c79dabb0a793bbd02deb02932/src/downloaders/task/DownloadTask.ts#L11)
