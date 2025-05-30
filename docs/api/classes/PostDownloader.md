[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / PostDownloader

# Class: PostDownloader

## Extends

- [`Downloader`](Downloader.md)\<[`Post`](../interfaces/Post.md)\>

## Constructors

### new PostDownloader()

> **new PostDownloader**(`bootstrap`, `options`?): [`PostDownloader`](PostDownloader.md)

#### Parameters

• **bootstrap**: [`PostDownloaderBootstrapData`](../interfaces/PostDownloaderBootstrapData.md)

• **options?**: [`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

[`PostDownloader`](PostDownloader.md)

#### Inherited from

[`Downloader`](Downloader.md).[`constructor`](Downloader.md#constructors)

#### Defined in

[src/downloaders/Downloader.ts:53](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L53)

## Properties

### name

> **name**: `string` = `'PostDownloader'`

#### Overrides

[`Downloader`](Downloader.md).[`name`](Downloader.md#name)

#### Defined in

[src/downloaders/PostDownloader.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/PostDownloader.ts#L21)

***

### version

> `static` **version**: `string` = `'1.1.1'`

#### Defined in

[src/downloaders/PostDownloader.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/PostDownloader.ts#L19)

## Methods

### \_\_getCampaign()

> **\_\_getCampaign**(`signal`?): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Parameters

• **signal?**: `AbortSignal`

#### Returns

`Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Defined in

[src/downloaders/PostDownloader.ts:604](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/PostDownloader.ts#L604)

***

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

#### Inherited from

[`Downloader`](Downloader.md).[`emit`](Downloader.md#emit)

#### Defined in

[src/downloaders/Downloader.ts:511](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L511)

***

### getConfig()

> **getConfig**(): `object`

#### Returns

`object`

##### cookie?

> `readonly` `optional` **cookie**: `string`

##### dirNameFormat

> `readonly` **dirNameFormat**: `object`

##### dirNameFormat.campaign

> `readonly` **campaign**: `string`

##### dirNameFormat.content

> `readonly` **content**: `string`

##### dryRun

> `readonly` **dryRun**: `boolean`

##### embedDownloaders

> `readonly` **embedDownloaders**: readonly `object`[]

##### fileExistsAction

> `readonly` **fileExistsAction**: `object`

##### fileExistsAction.content

> `readonly` **content**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

##### fileExistsAction.info

> `readonly` **info**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

##### fileExistsAction.infoAPI

> `readonly` **infoAPI**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

##### filenameFormat

> `readonly` **filenameFormat**: `object`

##### filenameFormat.media

> `readonly` **media**: `string`

##### include

> `readonly` **include**: `object`

##### include.allMediaVariants

> `readonly` **allMediaVariants**: `boolean`

##### include.campaignInfo

> `readonly` **campaignInfo**: `boolean`

##### include.comments

> `readonly` **comments**: `boolean`

##### include.contentInfo

> `readonly` **contentInfo**: `boolean`

##### include.contentMedia

> `readonly` **contentMedia**: `boolean` \| readonly (`"attachment"` \| `"file"` \| `"audio"` \| `"video"` \| `"image"`)[]

##### include.lockedContent

> `readonly` **lockedContent**: `boolean`

##### include.mediaByFilename

> `readonly` **mediaByFilename**: `object`

##### include.mediaByFilename.attachments

> `readonly` **attachments**: `null` \| `string`

##### include.mediaByFilename.audio

> `readonly` **audio**: `null` \| `string`

##### include.mediaByFilename.images

> `readonly` **images**: `null` \| `string`

##### include.postsInTier

> `readonly` **postsInTier**: readonly `string`[] \| `"any"`

##### include.postsPublished

> `readonly` **postsPublished**: `object`

##### include.postsPublished.after

> `readonly` **after**: `null` \| `object`

##### include.postsPublished.before

> `readonly` **before**: `null` \| `object`

##### include.postsWithMediaType

> `readonly` **postsWithMediaType**: `"none"` \| `"any"` \| readonly (`"attachment"` \| `"audio"` \| `"video"` \| `"image"` \| `"podcast"`)[]

##### include.previewMedia

> `readonly` **previewMedia**: `boolean` \| readonly (`"audio"` \| `"video"` \| `"image"`)[]

##### outDir

> `readonly` **outDir**: `string`

##### pathToFFmpeg

> `readonly` **pathToFFmpeg**: `null` \| `string`

##### pathToYouTubeCredentials

> `readonly` **pathToYouTubeCredentials**: `null` \| `string`

##### postFetch

> `readonly` **postFetch**: `object` \| `object` \| `object` \| `object`

##### request

> `readonly` **request**: `object`

##### request.maxConcurrent

> `readonly` **maxConcurrent**: `number`

##### request.maxRetries

> `readonly` **maxRetries**: `number`

##### request.minTime

> `readonly` **minTime**: `number`

##### request.proxy

> `readonly` **proxy**: `null` \| `object`

##### stopOn

> `readonly` **stopOn**: [`StopOnCondition`](../type-aliases/StopOnCondition.md)

##### targetURL

> `readonly` **targetURL**: `string`

##### useStatusCache

> `readonly` **useStatusCache**: `boolean`

#### Inherited from

[`Downloader`](Downloader.md).[`getConfig`](Downloader.md#getconfig)

#### Defined in

[src/downloaders/Downloader.ts:437](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L437)

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

#### Inherited from

[`Downloader`](Downloader.md).[`off`](Downloader.md#off)

#### Defined in

[src/downloaders/Downloader.ts:506](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L506)

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

#### Inherited from

[`Downloader`](Downloader.md).[`on`](Downloader.md#on)

#### Defined in

[src/downloaders/Downloader.ts:496](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L496)

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

#### Inherited from

[`Downloader`](Downloader.md).[`once`](Downloader.md#once)

#### Defined in

[src/downloaders/Downloader.ts:501](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L501)

***

### start()

> **start**(`params`?): `Promise`\<`void`\>

#### Parameters

• **params?**: [`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Downloader`](Downloader.md).[`start`](Downloader.md#start)

#### Defined in

[src/downloaders/PostDownloader.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/PostDownloader.ts#L25)

***

### getCampaign()

> `static` **getCampaign**(`creator`, `signal`?, `logger`?): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Parameters

• **creator**: `string` \| [`UserIdOrVanityParam`](../type-aliases/UserIdOrVanityParam.md)

• **signal?**: `AbortSignal`

• **logger?**: `null` \| [`Logger`](Logger.md)

#### Returns

`Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Inherited from

[`Downloader`](Downloader.md).[`getCampaign`](Downloader.md#getcampaign)

#### Defined in

[src/downloaders/Downloader.ts:246](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L246)

***

### getInstance()

> `static` **getInstance**(`url`, `options`?): `Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

#### Parameters

• **url**: `string`

• **options?**: [`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

`Promise`\<[`PostDownloader`](PostDownloader.md) \| [`ProductDownloader`](ProductDownloader.md)\>

#### Inherited from

[`Downloader`](Downloader.md).[`getInstance`](Downloader.md#getinstance)

#### Defined in

[src/downloaders/Downloader.ts:229](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/downloaders/Downloader.ts#L229)
