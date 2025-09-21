[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / PostDownloader

# Class: PostDownloader

Defined in: [src/downloaders/PostDownloader.ts:18](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/PostDownloader.ts#L18)

## Extends

- [`Downloader`](Downloader.md)\<[`Post`](../interfaces/Post.md)\>

## Constructors

### Constructor

> **new PostDownloader**(`config`, `db`, `logger?`): `PostDownloader`

Defined in: [src/downloaders/Downloader.ts:67](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L67)

#### Parameters

##### config

[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<[`Post`](../interfaces/Post.md)\>

##### db

() => `Promise`\<`DBInstance`\>

##### logger?

`null` | [`Logger`](Logger.md)

#### Returns

`PostDownloader`

#### Inherited from

[`Downloader`](Downloader.md).[`constructor`](Downloader.md#constructor)

## Properties

### name

> **name**: `string` = `'PostDownloader'`

Defined in: [src/downloaders/PostDownloader.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/PostDownloader.ts#L22)

#### Overrides

[`Downloader`](Downloader.md).[`name`](Downloader.md#name)

***

### version

> `static` **version**: `string` = `'1.1.1'`

Defined in: [src/downloaders/PostDownloader.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/PostDownloader.ts#L20)

## Methods

### \_\_getCampaign()

> **\_\_getCampaign**(`signal?`): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

Defined in: [src/downloaders/PostDownloader.ts:650](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/PostDownloader.ts#L650)

#### Parameters

##### signal?

`AbortSignal`

#### Returns

`Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

***

### emit()

> **emit**\<`T`\>(`event`, `args`): `boolean`

Defined in: [src/downloaders/Downloader.ts:582](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L582)

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

#### Inherited from

[`Downloader`](Downloader.md).[`emit`](Downloader.md#emit)

***

### getConfig()

> **getConfig**(): `object`

Defined in: [src/downloaders/Downloader.ts:508](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L508)

#### Returns

`object`

##### cookie?

> `readonly` `optional` **cookie**: `string`

##### dirNameFormat

> `readonly` **dirNameFormat**: `object`

###### dirNameFormat.campaign

> `readonly` **campaign**: `string`

###### dirNameFormat.content

> `readonly` **content**: `string`

##### dryRun

> `readonly` **dryRun**: `boolean`

##### embedDownloaders

> `readonly` **embedDownloaders**: readonly `object`[]

##### fileExistsAction

> `readonly` **fileExistsAction**: `object`

###### fileExistsAction.content

> `readonly` **content**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

###### fileExistsAction.info

> `readonly` **info**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

###### fileExistsAction.infoAPI

> `readonly` **infoAPI**: [`FileExistsAction`](../type-aliases/FileExistsAction.md)

##### filenameFormat

> `readonly` **filenameFormat**: `object`

###### filenameFormat.media

> `readonly` **media**: `string`

##### include

> `readonly` **include**: `object`

###### include.allMediaVariants

> `readonly` **allMediaVariants**: `boolean`

###### include.campaignInfo

> `readonly` **campaignInfo**: `boolean`

###### include.comments

> `readonly` **comments**: `boolean`

###### include.contentInfo

> `readonly` **contentInfo**: `boolean`

###### include.contentMedia

> `readonly` **contentMedia**: `boolean` \| readonly (`"attachment"` \| `"file"` \| `"audio"` \| `"video"` \| `"image"`)[]

###### include.lockedContent

> `readonly` **lockedContent**: `boolean`

###### include.mediaByFilename

> `readonly` **mediaByFilename**: `object`

###### include.mediaByFilename.attachments

> `readonly` **attachments**: `null` \| `string`

###### include.mediaByFilename.audio

> `readonly` **audio**: `null` \| `string`

###### include.mediaByFilename.images

> `readonly` **images**: `null` \| `string`

###### include.postsInTier

> `readonly` **postsInTier**: readonly `string`[] \| `"any"`

###### include.postsPublished

> `readonly` **postsPublished**: `object`

###### include.postsPublished.after

> `readonly` **after**: `null` \| \{ `toString`: `string`; `valueOf`: `Date`; \}

###### include.postsPublished.before

> `readonly` **before**: `null` \| \{ `toString`: `string`; `valueOf`: `Date`; \}

###### include.postsWithMediaType

> `readonly` **postsWithMediaType**: `"none"` \| `"any"` \| readonly (`"attachment"` \| `"audio"` \| `"video"` \| `"image"` \| `"podcast"`)[]

###### include.previewMedia

> `readonly` **previewMedia**: `boolean` \| readonly (`"audio"` \| `"video"` \| `"image"`)[]

##### outDir

> `readonly` **outDir**: `string`

##### pathToFFmpeg

> `readonly` **pathToFFmpeg**: `null` \| `string`

##### pathToYouTubeCredentials

> `readonly` **pathToYouTubeCredentials**: `null` \| `string`

##### postFetch

> `readonly` **postFetch**: \{ `postId`: `string`; `type`: `"single"`; \} \| \{ `filters?`: \{[`key`: `string`]: `any`; \}; `type`: `"byUser"`; `vanity`: `string`; \} \| \{ `filters?`: \{[`key`: `string`]: `any`; \}; `type`: `"byUserId"`; `userId`: `string`; \} \| \{ `collectionId`: `string`; `filters?`: \{[`key`: `string`]: `any`; \}; `type`: `"byCollection"`; \}

##### request

> `readonly` **request**: `object`

###### request.maxConcurrent

> `readonly` **maxConcurrent**: `number`

###### request.maxRetries

> `readonly` **maxRetries**: `number`

###### request.minTime

> `readonly` **minTime**: `number`

###### request.proxy

> `readonly` **proxy**: `null` \| \{ `rejectUnauthorizedTLS`: `boolean`; `url`: `string`; \}

###### request.userAgent

> `readonly` **userAgent**: `string`

##### stopOn

> `readonly` **stopOn**: [`StopOnCondition`](../type-aliases/StopOnCondition.md)

##### targetURL

> `readonly` **targetURL**: `string`

##### type

> `readonly` **type**: `"post"`

##### useStatusCache

> `readonly` **useStatusCache**: `boolean`

#### Inherited from

[`Downloader`](Downloader.md).[`getConfig`](Downloader.md#getconfig)

***

### off()

> **off**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/Downloader.ts:577](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L577)

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

#### Inherited from

[`Downloader`](Downloader.md).[`off`](Downloader.md#off)

***

### on()

> **on**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/Downloader.ts:567](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L567)

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

#### Inherited from

[`Downloader`](Downloader.md).[`on`](Downloader.md#on)

***

### once()

> **once**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/Downloader.ts:572](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L572)

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

#### Inherited from

[`Downloader`](Downloader.md).[`once`](Downloader.md#once)

***

### start()

> **start**(`params?`): `Promise`\<`void`\>

Defined in: [src/downloaders/PostDownloader.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/PostDownloader.ts#L26)

#### Parameters

##### params?

[`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Downloader`](Downloader.md).[`start`](Downloader.md#start)

***

### getCampaign()

> `static` **getCampaign**(`params`, `signal?`, `options?`): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

Defined in: [src/downloaders/Downloader.ts:288](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L288)

#### Parameters

##### params

[`GetCampaignParams`](../type-aliases/GetCampaignParams.md)

##### signal?

`AbortSignal`

##### options?

`null` | [`Logger`](Logger.md) | `Pick`\<[`DownloaderOptions`](../interfaces/DownloaderOptions.md), `"cookie"` \| `"request"` \| `"logger"`\>

#### Returns

`Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

#### Inherited from

[`Downloader`](Downloader.md).[`getCampaign`](Downloader.md#getcampaign)

***

### getInstance()

> `static` **getInstance**(`url`, `options?`): `Promise`\<`PostDownloader` \| [`ProductDownloader`](ProductDownloader.md)\>

Defined in: [src/downloaders/Downloader.ts:261](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/downloaders/Downloader.ts#L261)

#### Parameters

##### url

`string`

##### options?

[`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

`Promise`\<`PostDownloader` \| [`ProductDownloader`](ProductDownloader.md)\>

#### Inherited from

[`Downloader`](Downloader.md).[`getInstance`](Downloader.md#getinstance)
