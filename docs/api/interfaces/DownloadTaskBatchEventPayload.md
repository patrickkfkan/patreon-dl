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

src/downloaders/task/DownloadTaskBatchEvent.ts:47

___

### taskAbort

• **taskAbort**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:33

___

### taskComplete

• **taskComplete**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:24

___

### taskError

• **taskError**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | [`DownloadTaskError`](../classes/DownloadTaskError.md) |
| `willRetry` | `boolean` |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:28

___

### taskProgress

• **taskProgress**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `progress` | ``null`` \| [`DownloadProgress`](DownloadProgress.md) |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:19

___

### taskSkip

• **taskSkip**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `reason` | [`DownloadTaskSkipReason`](../README.md#downloadtaskskipreason) |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:37

___

### taskSpawn

• **taskSpawn**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `origin` | [`IDownloadTask`](IDownloadTask.md) |
| `spawn` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:42

___

### taskStart

• **taskStart**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `task` | [`IDownloadTask`](IDownloadTask.md) |

#### Defined in

src/downloaders/task/DownloadTaskBatchEvent.ts:15
