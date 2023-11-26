[patreon-dl](../README.md) / DummyMediaItem

# Interface: DummyMediaItem

Minimal `MediaItem` typically used to represent media-type properties of elements, such
as video thumbnails and campaign avatar / cover photos.
As a `MediaItem` type, and hence also a `Downloadable` type, it can be used to create
`MediaFilenameResolver` and `DownloadTask` instances.

## Hierarchy

- [`MediaLike`](MediaLike.md)

  ↳ **`DummyMediaItem`**

## Table of contents

### Properties

- [filename](DummyMediaItem.md#filename)
- [id](DummyMediaItem.md#id)
- [mimeType](DummyMediaItem.md#mimetype)
- [srcURLs](DummyMediaItem.md#srcurls)
- [type](DummyMediaItem.md#type)

## Properties

### filename

• **filename**: ``null`` \| `string`

#### Inherited from

[MediaLike](MediaLike.md).[filename](MediaLike.md#filename)

#### Defined in

[src/entities/MediaItem.ts:4](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/entities/MediaItem.ts#L4)

___

### id

• **id**: `string`

#### Inherited from

[MediaLike](MediaLike.md).[id](MediaLike.md#id)

#### Defined in

[src/entities/MediaItem.ts:3](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/entities/MediaItem.ts#L3)

___

### mimeType

• **mimeType**: ``null`` \| `string`

#### Inherited from

[MediaLike](MediaLike.md).[mimeType](MediaLike.md#mimetype)

#### Defined in

[src/entities/MediaItem.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/entities/MediaItem.ts#L5)

___

### srcURLs

• **srcURLs**: `Record`\<`string`, ``null`` \| `string`\>

#### Defined in

[src/entities/MediaItem.ts:115](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/entities/MediaItem.ts#L115)

___

### type

• **type**: ``"dummy"``

#### Overrides

[MediaLike](MediaLike.md).[type](MediaLike.md#type)

#### Defined in

[src/entities/MediaItem.ts:113](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/entities/MediaItem.ts#L113)
