[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / ProductDownloader

# Class: ProductDownloader

Defined in: [src/downloaders/ProductDownloader.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/ProductDownloader.ts#L15)

## Extends

- [`Downloader`](Downloader.md)\<[`Product`](../interfaces/Product.md)\>

## Constructors

### Constructor

> **new ProductDownloader**(`config`, `db`, `logger?`): `ProductDownloader`

Defined in: [src/downloaders/Downloader.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L71)

#### Parameters

##### config

[`DownloaderConfig`](../type-aliases/DownloaderConfig.md)\<[`Product`](../interfaces/Product.md)\>

##### db

() => `Promise`\<`EnvDB`\<\{(...`args`): `ContentDB`\<\{(...`args`): `CampaignDB`\<... & ... & ...\>; `prototype`: `CampaignDB`\<`any`\>; \} & \{(...`args`): `UserDB`\<... & ...\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `ContentDB`\<`any`\>; \} & \{(...`args`): `CampaignDB`\<\{(...`args`): `UserDB`\<... & ...\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `CampaignDB`\<`any`\>; \} & \{(...`args`): `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `ContentDB`\<\{(...`args`): `CampaignDB`\<\{(...`args`): `UserDB`\<... & ...\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `CampaignDB`\<`any`\>; \} & \{(...`args`): `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `CampaignDB`\<\{(...`args`): `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\>; `prototype`: `UserDB`\<`any`\>; \} & \{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `UserDB`\<\{(...`args`): `MediaDB`; `prototype`: `MediaDB`\<`any`\>; \} & *typeof* `DBBase`\> & `MediaDB`\<*typeof* `DBBase`\> & `DBBase`\>

##### logger?

`null` | [`Logger`](Logger.md)

#### Returns

`ProductDownloader`

#### Inherited from

[`Downloader`](Downloader.md).[`constructor`](Downloader.md#constructor)

## Properties

### name

> **name**: `string` = `'ProductDownloader'`

Defined in: [src/downloaders/ProductDownloader.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/ProductDownloader.ts#L19)

#### Overrides

[`Downloader`](Downloader.md).[`name`](Downloader.md#name)

***

### version

> `static` **version**: `string` = `'1.0.1'`

Defined in: [src/downloaders/ProductDownloader.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/ProductDownloader.ts#L17)

## Methods

### doStart()

> **doStart**(`params?`): `Promise`\<`void`\>

Defined in: [src/downloaders/ProductDownloader.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/ProductDownloader.ts#L23)

#### Parameters

##### params?

[`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Downloader`](Downloader.md).[`doStart`](Downloader.md#dostart)

***

### emit()

> **emit**\<`T`\>(`event`, `args`): `boolean`

Defined in: [src/downloaders/Downloader.ts:677](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L677)

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

Defined in: [src/downloaders/Downloader.ts:540](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L540)

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

###### include.mediaThumbnails

> `readonly` **mediaThumbnails**: `boolean`

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

###### include.productsPublished

> `readonly` **productsPublished**: `object`

###### include.productsPublished.after

> `readonly` **after**: `null` \| \{ `toString`: `string`; `valueOf`: `Date`; \}

###### include.productsPublished.before

> `readonly` **before**: `null` \| \{ `toString`: `string`; `valueOf`: `Date`; \}

##### maxVideoResolution?

> `readonly` `optional` **maxVideoResolution**: `null` \| `number`

##### outDir

> `readonly` **outDir**: `string`

##### pathToDeno

> `readonly` **pathToDeno**: `null` \| `string`

##### pathToFFmpeg

> `readonly` **pathToFFmpeg**: `null` \| `string`

##### pathToYouTubeCredentials

> `readonly` **pathToYouTubeCredentials**: `null` \| `string`

##### productFetch

> `readonly` **productFetch**: \{ `productId`: `string`; `type`: `"single"`; \} \| \{ `campaignId?`: `string`; `type`: `"byShop"`; `vanity`: `string`; \}

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

> `readonly` **type**: `"product"`

##### useStatusCache

> `readonly` **useStatusCache**: `boolean`

#### Inherited from

[`Downloader`](Downloader.md).[`getConfig`](Downloader.md#getconfig)

***

### off()

> **off**\<`T`\>(`event`, `listener`): `this`

Defined in: [src/downloaders/Downloader.ts:672](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L672)

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

Defined in: [src/downloaders/Downloader.ts:662](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L662)

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

Defined in: [src/downloaders/Downloader.ts:667](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L667)

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

> **start**(`params`): `Promise`\<`void`\>

Defined in: [src/downloaders/Downloader.ts:265](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L265)

#### Parameters

##### params

[`DownloaderStartParams`](../interfaces/DownloaderStartParams.md)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Downloader`](Downloader.md).[`start`](Downloader.md#start)

***

### getCampaign()

> `static` **getCampaign**(`params`, `signal?`, `options?`): `Promise`\<`null` \| [`Campaign`](../interfaces/Campaign.md)\>

Defined in: [src/downloaders/Downloader.ts:306](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L306)

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

> `static` **getInstance**(`target`, `options?`): `Promise`\<[`PostDownloader`](PostDownloader.md) \| `ProductDownloader`\>

Defined in: [src/downloaders/Downloader.ts:276](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Downloader.ts#L276)

#### Parameters

##### target

`string` | [`ProductDownloaderBootstrapData`](../interfaces/ProductDownloaderBootstrapData.md) | [`PostDownloaderBootstrapData`](../interfaces/PostDownloaderBootstrapData.md)

##### options?

[`DownloaderOptions`](../interfaces/DownloaderOptions.md)

#### Returns

`Promise`\<[`PostDownloader`](PostDownloader.md) \| `ProductDownloader`\>

#### Inherited from

[`Downloader`](Downloader.md).[`getInstance`](Downloader.md#getinstance)
