[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / IDownloadTaskBatch

# Interface: IDownloadTaskBatch

## Extends

- `EventEmitter`

## Properties

### allTasksEnded()

> **allTasksEnded**: () => `boolean`

#### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L24)

***

### getTasks()

> **getTasks**: (`status`?) => [`IDownloadTask`](IDownloadTask.md)[]

#### Parameters

• **status?**: [`DownloadTaskStatus`](../type-aliases/DownloadTaskStatus.md)

#### Returns

[`IDownloadTask`](IDownloadTask.md)[]

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L28)

***

### hasErrors()

> **hasErrors**: () => `boolean`

#### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L25)

***

### id

> **id**: `number`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L22)

***

### isAborted()

> **isAborted**: () => `boolean`

#### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L27)

***

### isDestroyed()

> **isDestroyed**: () => `boolean`

#### Returns

`boolean`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L26)

***

### name

> **name**: `string`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L23)

## Methods

### off()

> **off**\<`T`\>(`event`, `listener`): `this`

Alias for `emitter.removeListener()`.

#### Type Parameters

• **T** *extends* [`DownloadTaskBatchEvent`](../type-aliases/DownloadTaskBatchEvent.md)

#### Parameters

• **event**: `T`

• **listener**

#### Returns

`this`

#### Since

v10.0.0

#### Overrides

`EventEmitter.off`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:31](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L31)

***

### on()

> **on**\<`T`\>(`event`, `listener`): `this`

Adds the `listener` function to the end of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName` and `listener` will result in the `listener` being added, and called, multiple
times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The`emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

• **T** *extends* [`DownloadTaskBatchEvent`](../type-aliases/DownloadTaskBatchEvent.md)

#### Parameters

• **event**: `T`

• **listener**

The callback function

#### Returns

`this`

#### Since

v0.1.101

#### Overrides

`EventEmitter.on`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L29)

***

### once()

> **once**\<`T`\>(`event`, `listener`): `this`

Adds a **one-time**`listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The`emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

• **T** *extends* [`DownloadTaskBatchEvent`](../type-aliases/DownloadTaskBatchEvent.md)

#### Parameters

• **event**: `T`

• **listener**

The callback function

#### Returns

`this`

#### Since

v0.3.0

#### Overrides

`EventEmitter.once`

#### Defined in

[src/downloaders/task/DownloadTaskBatch.ts:30](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/downloaders/task/DownloadTaskBatch.ts#L30)
