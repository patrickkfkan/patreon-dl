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

[src/downloaders/task/DownloadTaskBatch.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L19)

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

[src/downloaders/task/DownloadTaskBatch.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L23)

___

### hasErrors

• **hasErrors**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L20)

___

### id

• **id**: `number`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L17)

___

### isAborted

• **isAborted**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L22)

___

### isDestroyed

• **isDestroyed**: () => `boolean`

#### Type declaration

▸ (): `boolean`

##### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L21)

___

### name

• **name**: `string`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:18](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L18)

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

[src/downloaders/task/DownloadTaskBatch.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L26)

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

[src/downloaders/task/DownloadTaskBatch.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L24)

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

[src/downloaders/task/DownloadTaskBatch.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTaskBatch.ts#L25)
