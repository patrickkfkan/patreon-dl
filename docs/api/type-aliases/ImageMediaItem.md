[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / ImageMediaItem

# Type Alias: ImageMediaItem\<T\>

> **ImageMediaItem**\<`T`\> = `T` *extends* `"single"` ? [`SingleImageMediaItem`](../interfaces/SingleImageMediaItem.md) : `T` *extends* `"default"` ? [`DefaultImageMediaItem`](../interfaces/DefaultImageMediaItem.md) : `T` *extends* `"campaignCoverPhoto"` ? [`CampaignCoverPhotoMediaItem`](../interfaces/CampaignCoverPhotoMediaItem.md) : `T` *extends* `"postCoverImage"` ? [`PostCoverImageMediaItem`](../interfaces/PostCoverImageMediaItem.md) : `T` *extends* `"postThumbnail"` ? [`PostThumbnailMediaItem`](../interfaces/PostThumbnailMediaItem.md) : `T` *extends* `"collectionThumbnail"` ? [`CollectionThumbnailMediaItem`](../interfaces/CollectionThumbnailMediaItem.md) : `never`

Defined in: [src/entities/MediaItem.ts:90](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/MediaItem.ts#L90)

## Type Parameters

### T

`T` *extends* [`ImageType`](ImageType.md)
