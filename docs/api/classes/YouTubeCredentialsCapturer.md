[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / YouTubeCredentialsCapturer

# Class: YouTubeCredentialsCapturer

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:9](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L9)

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new YouTubeCredentialsCapturer**(): `YouTubeCredentialsCapturer`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L17)

#### Returns

`YouTubeCredentialsCapturer`

#### Overrides

`EventEmitter.constructor`

## Methods

### abort()

> **abort**(): `void`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L33)

#### Returns

`void`

***

### begin()

> **begin**(): `Promise`\<`void`\>

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L26)

#### Returns

`Promise`\<`void`\>

***

### emit()

#### Call Signature

> **emit**(`eventName`, `data`): `boolean`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:68](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L68)

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

##### Parameters

###### eventName

`"pending"`

###### data

[`YouTubeCredentialsPendingInfo`](../interfaces/YouTubeCredentialsPendingInfo.md)

##### Returns

`boolean`

##### Since

v0.1.26

##### Overrides

`EventEmitter.emit`

#### Call Signature

> **emit**(`eventName`, `credentials`): `boolean`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:69](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L69)

##### Parameters

###### eventName

`"capture"`

###### credentials

`object`

##### Returns

`boolean`

##### Overrides

`EventEmitter.emit`

***

### off()

#### Call Signature

> **off**(`eventName`, `listener`): `this`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:62](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L62)

Alias for `emitter.removeListener()`.

##### Parameters

###### eventName

`"pending"`

###### listener

(`data`) => `void`

##### Returns

`this`

##### Since

v10.0.0

##### Overrides

`EventEmitter.off`

#### Call Signature

> **off**(`eventName`, `listener`): `this`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:63](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L63)

##### Parameters

###### eventName

`"capture"`

###### listener

(`credentials`) => `void`

##### Returns

`this`

##### Overrides

`EventEmitter.off`

***

### on()

#### Call Signature

> **on**(`eventName`, `listener`): `this`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:50](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L50)

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

##### Parameters

###### eventName

`"pending"`

The name of the event.

###### listener

(`data`) => `void`

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Overrides

`EventEmitter.on`

#### Call Signature

> **on**(`eventName`, `listener`): `this`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:51](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L51)

##### Parameters

###### eventName

`"capture"`

###### listener

(`credentials`) => `void`

##### Returns

`this`

##### Overrides

`EventEmitter.on`

***

### once()

#### Call Signature

> **once**(`eventName`, `listener`): `this`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:56](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L56)

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

##### Parameters

###### eventName

`"pending"`

The name of the event.

###### listener

(`data`) => `void`

The callback function

##### Returns

`this`

##### Since

v0.3.0

##### Overrides

`EventEmitter.once`

#### Call Signature

> **once**(`eventName`, `listener`): `this`

Defined in: [src/utils/YouTubeCredentialsCapturer.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/YouTubeCredentialsCapturer.ts#L57)

##### Parameters

###### eventName

`"capture"`

###### listener

(`credentials`) => `void`

##### Returns

`this`

##### Overrides

`EventEmitter.once`
