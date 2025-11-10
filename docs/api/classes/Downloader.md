[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / Downloader

# Class: `abstract` Downloader\<T\>

Defined in: [src/downloaders/Downloader.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L55)

## Extends

- `EventEmitter`

## Extended by

- [`PostDownloader`](PostDownloader.md)
- [`ProductDownloader`](ProductDownloader.md)

## Type Parameters

### T

`T` *extends* [`DownloaderType`](../type-aliases/DownloaderType.md)

## Constructors

### Constructor

> **new Downloader**\<`T`\>(`config`, `db`, `logger?`): `Downloader`\<`T`\>

Defined in: [src/downloaders/Downloader.ts:68](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L68)

#### Parameters

##### config

[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<`T`\>

##### db

() => `Promise`\<`EnvDB`\<\{(...`args`): `ContentDB`\<\{(...`args`): `CampaignDB`\<... & ... & ...\>; `prototype`: `CampaignDB`\<`any`\>; \} & \{(...`args`): `UserDB`\<... & ...\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `ContentDB`\<`any`\>; \} & \{(...`args`): `CampaignDB`\<\{(...`args`): `UserDB`\<... & ...\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `CampaignDB`\<`any`\>; \} & \{(...`args`): `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `ContentDB`\<\{(...`args`): `CampaignDB`\<\{(...`args`): `UserDB`\<... & ...\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `CampaignDB`\<`any`\>; \} & \{(...`args`): `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `CampaignDB`\<\{(...`args`): `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `MediaDB`\<*typeof* `DBBase`\> & `DBBase`\>

##### logger?

`null` | [`Logger`](Logger.md)

#### Returns

`Downloader`\<`T`\>

#### Overrides

`EventEmitter.constructor`

## Properties

### name

> `abstract` **name**: `string`

Defined in: [src/downloaders/Downloader.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L57)

## Methods

### doStart()

> `abstract` **doStart**(`params`): `Promise`\<`void`\>

Defined in: [src/downloaders/Downloader.ts:269](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L269)

#### Parameters

##### params

[`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

***

### emit()

> **emit**\<`T`\>(`event`, `args`): `boolean`

Defined in: [src/downloaders/Downloader.ts:613](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L613)

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

##### T

`T` *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

#### Parameters

##### event

`T`

##### args

[`DownloaderEventPayloadOf`](../type-aliases/DownloaderEventPayloadOf.md)\<`T`\>

#### Returns

`boolean`

#### Since

v0.1.26

#### Overrides

`EventEmitter.emit`

***

### getConfig()

> **getConfig**(): `DeepReadonly`\<[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<`T`\>\>

Defined in: [src/downloaders/Downloader.ts:532](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L532)

#### Returns

`DeepReadonly`\<[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<`T`\>\>

***

### off()

> **off**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/Downloader.ts:608](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L608)

Alias for `emitter.removeListener()`.

#### Type Parameters

##### T

`T` *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

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

Defined in: [src/downloaders/Downloader.ts:598](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L598)

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

`T` *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

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

Defined in: [src/downloaders/Downloader.ts:603](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L603)

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

`T` *extends* [`DownloaderEvent`](../type-aliases/DownloaderEvent.md)

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

***

### start()

> **start**(`params`): `Promise`\<`void`\>

Defined in: [src/downloaders/Downloader.ts:260](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L260)

#### Parameters

##### params

[`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

***

### getCampaign()

> `static` **getCampaign**(`params`, `signal?`, `options?`): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

Defined in: [src/downloaders/Downloader.ts:298](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L298)

#### Parameters

##### params

[`GetCampaignParams`](../type-aliases/GetCampaignParams.md)

##### signal?

`AbortSignal`

##### options?

`null` | [`Logger`](Logger.md) | `Pick`\<[`DownloaderOptions`](../interfaces/DownloaderOptions.md), `"cookie"` \| `"request"` \| `"logger"`\>

#### Returns

`Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

***

### getInstance()

> `static` **getInstance**(`url`, `options?`): `Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

Defined in: [src/downloaders/Downloader.ts:271](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Downloader.ts#L271)

#### Parameters

##### url

`string`

##### options?

[`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

`Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>
