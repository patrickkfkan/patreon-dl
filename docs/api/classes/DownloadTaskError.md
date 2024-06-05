[patreon-dl](../README.md) / DownloadTaskError

# Class: DownloadTaskError

## Hierarchy

- `Error`

  ↳ **`DownloadTaskError`**

## Table of contents

### Constructors

- [constructor](DownloadTaskError.md#constructor)

### Properties

- [cause](DownloadTaskError.md#cause)
- [task](DownloadTaskError.md#task)

## Constructors

### constructor

• **new DownloadTaskError**(`message`, `task`, `cause?`): [`DownloadTaskError`](DownloadTaskError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `task` | [`IDownloadTask`](../interfaces/IDownloadTask.md) |
| `cause?` | `Error` |

#### Returns

[`DownloadTaskError`](DownloadTaskError.md)

#### Overrides

Error.constructor

#### Defined in

[src/downloaders/task/DownloadTask.ts:11](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTask.ts#L11)

## Properties

### cause

• `Optional` **cause**: `Error`

#### Overrides

Error.cause

#### Defined in

[src/downloaders/task/DownloadTask.ts:9](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTask.ts#L9)

___

### task

• **task**: [`IDownloadTask`](../interfaces/IDownloadTask.md)

#### Defined in

[src/downloaders/task/DownloadTask.ts:8](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/downloaders/task/DownloadTask.ts#L8)
