[patreon-dl](../README.md) / VideoMediaItem

# Interface: VideoMediaItem

## Hierarchy

- [`MediaLike`](MediaLike.md)

  ↳ **`VideoMediaItem`**

## Table of contents

### Properties

- [createdAt](VideoMediaItem.md#createdat)
- [displayURLs](VideoMediaItem.md#displayurls)
- [downloadURL](VideoMediaItem.md#downloadurl)
- [duration](VideoMediaItem.md#duration)
- [filename](VideoMediaItem.md#filename)
- [id](VideoMediaItem.md#id)
- [mimeType](VideoMediaItem.md#mimetype)
- [size](VideoMediaItem.md#size)
- [type](VideoMediaItem.md#type)

## Properties

### createdAt

• **createdAt**: ``null`` \| `string`

#### Defined in

[src/entities/MediaItem.ts:81](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L81)

___

### displayURLs

• **displayURLs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `thumbnail` | ``null`` \| `string` |
| `video` | ``null`` \| `string` |

#### Defined in

[src/entities/MediaItem.ts:88](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L88)

___

### downloadURL

• **downloadURL**: ``null`` \| `string`

#### Defined in

[src/entities/MediaItem.ts:87](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L87)

___

### duration

• **duration**: ``null`` \| `number`

#### Defined in

[src/entities/MediaItem.ts:86](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L86)

___

### filename

• **filename**: ``null`` \| `string`

#### Inherited from

[MediaLike](MediaLike.md).[filename](MediaLike.md#filename)

#### Defined in

[src/entities/MediaItem.ts:4](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L4)

___

### id

• **id**: `string`

#### Inherited from

[MediaLike](MediaLike.md).[id](MediaLike.md#id)

#### Defined in

[src/entities/MediaItem.ts:3](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L3)

___

### mimeType

• **mimeType**: ``null`` \| `string`

#### Inherited from

[MediaLike](MediaLike.md).[mimeType](MediaLike.md#mimetype)

#### Defined in

[src/entities/MediaItem.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L5)

___

### size

• **size**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `height` | ``null`` \| `number` |
| `width` | ``null`` \| `number` |

#### Defined in

[src/entities/MediaItem.ts:82](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L82)

___

### type

• **type**: ``"video"``

#### Overrides

[MediaLike](MediaLike.md).[type](MediaLike.md#type)

#### Defined in

[src/entities/MediaItem.ts:80](https://github.com/patrickkfkan/patreon-dl/blob/53a3978/src/entities/MediaItem.ts#L80)
