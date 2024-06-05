[patreon-dl](../README.md) / DownloadTaskBatchEventPayload

# Interface: DownloadTaskBatchEventPayload

## Table of contents

### Properties

- [complete](DownloadTaskBatchEventPayload.md#complete)
- [taskAbort](DownloadTaskBatchEventPayload.md#taskabort)
- [taskComplete](DownloadTaskBatchEventPayload.md#taskcomplete)
- [taskError](DownloadTaskBatchEventPayload.md#taskerror)
- [taskProgress](DownloadTaskBatchEventPayload.md#taskprogress)
- [taskSkip](DownloadTaskBatchEventPayload.md#taskskip)
- [taskSpawn](DownloadTaskBatchEventPayload.md#taskspawn)
- [taskStart](DownloadTaskBatchEventPayload.md#taskstart)

## Properties

### complete

• **complete**: `Object`

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L47)

___

### taskAbort

• **taskAbort**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L33)

___

### taskComplete

• **taskComplete**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L24)

___

### taskError

• **taskError**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | [`DownloadTaskError`](../classes/DownloadTaskError.md) |
| `willRetry` | `boolean` |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L28)

___

### taskProgress

• **taskProgress**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `progress` | ``null`` \| [`DownloadProgress`](DownloadProgress.md) |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L19)

___

### taskSkip

• **taskSkip**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `reason` | [`DownloadTaskSkipReason`](../README.md#downloadtaskskipreason) |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L37)

___

### taskSpawn

• **taskSpawn**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `origin` | [`IDownloadTask`](IDownloadTask.md) |
| `spawn` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L42)

___

### taskStart

• **taskStart**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

[src/downloaders/task/DownloadTaskBatchEvent.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatchEvent.ts#L15)
