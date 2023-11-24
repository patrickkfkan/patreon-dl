[patreon-dl](../README.md) / IDownloadTaskBatch

# Interface: IDownloadTaskBatch

## Hierarchy

- `EventEmitter`

  ↳ **`IDownloadTaskBatch`**

## Table of contents

### Properties

- [allTasksEnded](IDownloadTaskBatch.md#alltasksended)
- [getTasks](IDownloadTaskBatch.md#gettasks)
- [hasErrors](IDownloadTaskBatch.md#haserrors)
- [id](IDownloadTaskBatch.md#id)
- [isAborted](IDownloadTaskBatch.md#isaborted)
- [isDestroyed](IDownloadTaskBatch.md#isdestroyed)
- [name](IDownloadTaskBatch.md#name)

### Methods

- [off](IDownloadTaskBatch.md#off)
- [on](IDownloadTaskBatch.md#on)
- [once](IDownloadTaskBatch.md#once)

## Properties

### allTasksEnded

• **allTasksEnded**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:19

___

### getTasks

• **getTasks**: (`status?`: [`DownloadTaskStatus`](../README.md#downloadtaskstatus)) => [`IDownloadTask`](IDownloadTask.md)[]

#### Type declaration

▸ (`status?`): [`IDownloadTask`](IDownloadTask.md)[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `status?` | [`DownloadTaskStatus`](../README.md#downloadtaskstatus) |

##### Returns

[`IDownloadTask`](IDownloadTask.md)[]

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:23

___

### hasErrors

• **hasErrors**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:20

___

### id

• **id**: `number`

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:17

___

### isAborted

• **isAborted**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:22

___

### isDestroyed

• **isDestroyed**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:21

___

### name

• **name**: `string`

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:18

## Methods

### off

▸ **off**\<`T`\>(`event`, `listener`): [`IDownloadTaskBatch`](IDownloadTaskBatch.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloadTaskBatchEvent`](../README.md#downloadtaskbatchevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | (`args`: [`DownloadTaskBatchEventPayloadOf`](../README.md#downloadtaskbatcheventpayloadof)\<`T`\>) => `void` |

#### Returns

[`IDownloadTaskBatch`](IDownloadTaskBatch.md)

#### Overrides

EventEmitter.off

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:26

___

### on

▸ **on**\<`T`\>(`event`, `listener`): [`IDownloadTaskBatch`](IDownloadTaskBatch.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloadTaskBatchEvent`](../README.md#downloadtaskbatchevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | (`args`: [`DownloadTaskBatchEventPayloadOf`](../README.md#downloadtaskbatcheventpayloadof)\<`T`\>) => `void` |

#### Returns

[`IDownloadTaskBatch`](IDownloadTaskBatch.md)

#### Overrides

EventEmitter.on

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:24

___

### once

▸ **once**\<`T`\>(`event`, `listener`): [`IDownloadTaskBatch`](IDownloadTaskBatch.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DownloadTaskBatchEvent`](../README.md#downloadtaskbatchevent) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `listener` | (`args`: [`DownloadTaskBatchEventPayloadOf`](../README.md#downloadtaskbatcheventpayloadof)\<`T`\>) => `void` |

#### Returns

[`IDownloadTaskBatch`](IDownloadTaskBatch.md)

#### Overrides

EventEmitter.once

#### Defined in

src/downloaders/task/DownloadTaskBatch.ts:25
