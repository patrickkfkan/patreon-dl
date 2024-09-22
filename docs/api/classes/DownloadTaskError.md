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

[src/downloaders/task/DownloadTask.ts:13](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/downloaders/task/DownloadTask.ts#L13)

## Properties

### cause?

> `optional` **cause**: `Error`

#### Overrides

`Error.cause`

#### Defined in

[src/downloaders/task/DownloadTask.ts:11](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/downloaders/task/DownloadTask.ts#L11)

***

### task

> **task**: [`IDownloadTask`](../interfaces/IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTask.ts:10](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/downloaders/task/DownloadTask.ts#L10)
