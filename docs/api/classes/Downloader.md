[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / Downloader

# Class: `abstract` Downloader\<T\>

## Extends

- `EventEmitter`

## Extended by

- [`PostDownloader`](PostDownloader.md)
- [`ProductDownloader`](ProductDownloader.md)

## Type Parameters

• **T** *extends* [`DownloaderType`](../type-aliases/DownloaderType.md)

## Constructors

### new Downloader()

> **new Downloader**\<`T`\>(`bootstrap`, `options`?): [`Downloader`](Downloader.md)\<`T`\>

#### Parameters

• **bootstrap**: [`DownloaderBootstrapData`](../type-aliases/DownloaderBootstrapData.md)\<`T`\>

• **options?**: [`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

[`Downloader`](Downloader.md)\<`T`\>

#### Overrides

`EventEmitter.constructor`

#### Defined in

[src/downloaders/Downloader.ts:53](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L53)

## Properties

### name

> `abstract` **name**: `string`

#### Defined in

[src/downloaders/Downloader.ts:44](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L44)

## Methods

### emit()

> **emit**\<`T`\>(`event`, `args`): `boolean`

Synchronously calls each of the listeners registered for the event named `eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Type Parameters

• **T** *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

#### Parameters

• **event**: `T`

• **args**: [`DownloaderEventPayloadOf`](../type-aliases/DownloaderEventPayloadOf.md)\<`T`\>

#### Returns

`boolean`

#### Since

v0.1.26

#### Overrides

`EventEmitter.emit`

#### Defined in

[src/downloaders/Downloader.ts:511](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L511)

***

### getConfig()

> **getConfig**(): `DeepReadonly`\<[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<`T`\>\>

#### Returns

`DeepReadonly`\<[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<`T`\>\>

#### Defined in

[src/downloaders/Downloader.ts:437](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L437)

***

### off()

> **off**\<`T`\>(`event`, `listener`): `this`

Alias for `emitter.removeListener()`.

#### Type Parameters

• **T** *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

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

[src/downloaders/Downloader.ts:506](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L506)

***

### on()

> **on**\<`T`\>(`event`, `listener`): `this`

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

• **T** *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

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

[src/downloaders/Downloader.ts:496](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L496)

***

### once()

> **once**\<`T`\>(`event`, `listener`): `this`

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

• **T** *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

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

[src/downloaders/Downloader.ts:501](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L501)

***

### start()

> `abstract` **start**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**: [`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/downloaders/Downloader.ts:227](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L227)

***

### getCampaign()

> `static` **getCampaign**(`creator`, `signal`?, `logger`?): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Parameters

• **creator**: `string` \| [`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

• **signal?**: `AbortSignal`

• **logger?**: `null` \| [`Logger`](Logger.md)

#### Returns

`Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Defined in

[src/downloaders/Downloader.ts:246](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L246)

***

### getInstance()

> `static` **getInstance**(`url`, `options`?): `Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

#### Parameters

• **url**: `string`

• **options?**: [`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

`Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

#### Defined in

[src/downloaders/Downloader.ts:229](https://github.com/patrickkfkan/patreon-dl/blob/7168e7165dfd3021aec234ee0e8458b1a8040c70/src/downloaders/Downloader.ts#L229)
