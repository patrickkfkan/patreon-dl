[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DummyMediaItem

# Interface: DummyMediaItem

Defined in: [src/entities/MediaItem.ts:118](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/entities/MediaItem.ts#L118)

Minimal `MediaItem` typically used to represent media-type properties of elements, such
as video thumbnails and campaign avatar / cover photos.
As a `MediaItem` type, and hence also a `Downloadable` type, it can be used to create
`MediaFilenameResolver` and `DownloadTask` instances.

## Extends

- [`MediaLike`](MediaLike.md)

## Properties

### filename

> **filename**: `null` \| `string`

Defined in: [src/entities/MediaItem.ts:4](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/entities/MediaItem.ts#L4)

#### Inherited from

[`MediaLike`](MediaLike.md).[`filename`](MediaLike.md#filename)

***

### id

> **id**: `string`

Defined in: [src/entities/MediaItem.ts:3](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/entities/MediaItem.ts#L3)

#### Inherited from

[`MediaLike`](MediaLike.md).[`id`](MediaLike.md#id)

***

### mimeType

> **mimeType**: `null` \| `string`

Defined in: [src/entities/MediaItem.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/entities/MediaItem.ts#L5)

#### Inherited from

[`MediaLike`](MediaLike.md).[`mimeType`](MediaLike.md#mimetype)

***

### srcURLs

> **srcURLs**: `Record`\<`string`, `string` \| `null`\>

Defined in: [src/entities/MediaItem.ts:121](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/entities/MediaItem.ts#L121)

***

### type

> **type**: `"dummy"`

Defined in: [src/entities/MediaItem.ts:119](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/entities/MediaItem.ts#L119)

#### Overrides

[`MediaLike`](MediaLike.md).[`type`](MediaLike.md#type)
