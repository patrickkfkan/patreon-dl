[patreon-dl](../README.md) / DefaultImageMediaItem

# Interface: DefaultImageMediaItem

## Hierarchy

- [`MediaLike`](MediaLike.md)

  ↳ **`DefaultImageMediaItem`**

## Table of contents

### Properties

- [createdAt](DefaultImageMediaItem.md#createdat)
- [downloadURL](DefaultImageMediaItem.md#downloadurl)
- [filename](DefaultImageMediaItem.md#filename)
- [id](DefaultImageMediaItem.md#id)
- [imageType](DefaultImageMediaItem.md#imagetype)
- [imageURLs](DefaultImageMediaItem.md#imageurls)
- [mimeType](DefaultImageMediaItem.md#mimetype)
- [type](DefaultImageMediaItem.md#type)

## Properties

### createdAt

• **createdAt**: ``null`` \| `string`

#### Defined in

[src/entities/MediaItem.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L24)

___

### downloadURL

• **downloadURL**: ``null`` \| `string`

#### Defined in

[src/entities/MediaItem.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L25)

___

### filename

• **filename**: ``null`` \| `string`

#### Inherited from

[MediaLike](MediaLike.md).[filename](MediaLike.md#filename)

#### Defined in

[src/entities/MediaItem.ts:4](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L4)

___

### id

• **id**: `string`

#### Inherited from

[MediaLike](MediaLike.md).[id](MediaLike.md#id)

#### Defined in

[src/entities/MediaItem.ts:3](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L3)

___

### imageType

• **imageType**: ``"default"``

#### Defined in

[src/entities/MediaItem.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L23)

___

### imageURLs

• **imageURLs**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `default` | ``null`` \| `string` |
| `defaultSmall` | ``null`` \| `string` |
| `original` | ``null`` \| `string` |
| `thumbnail` | ``null`` \| `string` |
| `thumbnailLarge` | ``null`` \| `string` |
| `thumbnailSmall` | ``null`` \| `string` |

#### Defined in

[src/entities/MediaItem.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L26)

___

### mimeType

• **mimeType**: ``null`` \| `string`

#### Inherited from

[MediaLike](MediaLike.md).[mimeType](MediaLike.md#mimetype)

#### Defined in

[src/entities/MediaItem.ts:5](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L5)

___

### type

• **type**: ``"image"``

#### Overrides

[MediaLike](MediaLike.md).[type](MediaLike.md#type)

#### Defined in

[src/entities/MediaItem.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/entities/MediaItem.ts#L22)
