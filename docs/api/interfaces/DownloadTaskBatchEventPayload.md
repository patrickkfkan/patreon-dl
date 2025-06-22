[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloadTaskBatchEventPayload

# Interface: DownloadTaskBatchEventPayload

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:13](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L13)

## Properties

### complete

> **complete**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L47)

***

### taskAbort

> **taskAbort**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L33)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

***

### taskComplete

> **taskComplete**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L24)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

***

### taskError

> **taskError**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L28)

#### error

> **error**: [`DownloadTaskError`](../classes/DownloadTaskError.md)

#### willRetry

> **willRetry**: `boolean`

***

### taskProgress

> **taskProgress**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L19)

#### progress

> **progress**: `null` \| [`DownloadProgress`](DownloadProgress.md)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

***

### taskSkip

> **taskSkip**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L37)

#### reason

> **reason**: [`DownloadTaskSkipReason`](../type-aliases/DownloadTaskSkipReason.md)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

***

### taskSpawn

> **taskSpawn**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L42)

#### origin

> **origin**: [`IDownloadTask`](IDownloadTask.md)

#### spawn

> **spawn**: [`IDownloadTask`](IDownloadTask.md)

***

### taskStart

> **taskStart**: `object`

Defined in: [src/downloaders/task/DownloadTaskBatchEvent.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTaskBatchEvent.ts#L15)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)
