[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / IDownloadTaskBatch

# Interface: IDownloadTaskBatch

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L21)

## Extends

- `EventEmitter`

## Properties

### allTasksEnded()

> **allTasksEnded**: () => `boolean`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L24)

#### Returns

`boolean`

***

### getTasks()

> **getTasks**: (`status?`) => [`IDownloadTask`](IDownloadTask.md)[]

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L28)

#### Parameters

##### status?

[`DownloadTaskStatus`](../type-aliases/DownloadTaskStatus.md)

#### Returns

[`IDownloadTask`](IDownloadTask.md)[]

***

### hasErrors()

> **hasErrors**: () => `boolean`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L25)

#### Returns

`boolean`

***

### id

> **id**: `number`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L22)

***

### isAborted()

> **isAborted**: () => `boolean`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L27)

#### Returns

`boolean`

***

### isDestroyed()

> **isDestroyed**: () => `boolean`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L26)

#### Returns

`boolean`

***

### name

> **name**: `string`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L23)

## Methods

### off()

> **off**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:31](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L31)

Alias for `emitter.removeListener()`.

#### Type Parameters

##### T

`T` *extends* [`DownloadTaskBatchEvent`](../type-aliases/DownloadTaskBatchEvent.md)

#### Parameters

##### event

`T`

##### listener

(`args`) => `void`

#### Returns

`this`

#### Since

v10.0.0

#### Overrides

`EventEmitter.off`

***

### on()

> **on**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L29)

Adds the `listener` function to the end of the listeners array for the event
named `eventName`. No checks are made to see if the `listener` has already
been added. Multiple calls passing the same combination of `eventName` and
`listener` will result in the `listener` being added, and called, multiple times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

##### T

`T` *extends* [`DownloadTaskBatchEvent`](../type-aliases/DownloadTaskBatchEvent.md)

#### Parameters

##### event

`T`

##### listener

(`args`) => `void`

The callback function

#### Returns

`this`

#### Since

v0.1.101

#### Overrides

`EventEmitter.on`

***

### once()

> **once**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/task/DownloadTaskBatch.ts:30](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/task/DownloadTaskBatch.ts#L30)

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

##### T

`T` *extends* [`DownloadTaskBatchEvent`](../type-aliases/DownloadTaskBatchEvent.md)

#### Parameters

##### event

`T`

##### listener

(`args`) => `void`

The callback function

#### Returns

`this`

#### Since

v0.3.0

#### Overrides

`EventEmitter.once`
