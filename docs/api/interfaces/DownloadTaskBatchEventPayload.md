[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / DownloadTaskBatchEventPayload

# Interface: DownloadTaskBatchEventPayload

## Properties

### complete

> **complete**: `object`

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L47)

***

### taskAbort

> **taskAbort**: `object`

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L33)

***

### taskComplete

> **taskComplete**: `object`

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L24)

***

### taskError

> **taskError**: `object`

#### error

> **error**: [`DownloadTaskError`](../classes/DownloadTaskError.md)

#### willRetry

> **willRetry**: `boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L28)

***

### taskProgress

> **taskProgress**: `object`

#### progress

> **progress**: `null` \| [`DownloadProgress`](DownloadProgress.md)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L19)

***

### taskSkip

> **taskSkip**: `object`

#### reason

> **reason**: [`DownloadTaskSkipReason`](../type-aliases/DownloadTaskSkipReason.md)

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L37)

***

### taskSpawn

> **taskSpawn**: `object`

#### origin

> **origin**: [`IDownloadTask`](IDownloadTask.md)

#### spawn

> **spawn**: [`IDownloadTask`](IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L42)

***

### taskStart

> **taskStart**: `object`

#### task

> **task**: [`IDownloadTask`](IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/downloaders/task/DownloadTaskBatchEvent.ts#L15)
