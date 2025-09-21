[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / ImageMediaItem

# Type Alias: ImageMediaItem\<T\>

> **ImageMediaItem**\<`T`\> = `T` *extends* `"single"` ? [`SingleImageMediaItem`](../interfaces/SingleImageMediaItem.md) : `T` *extends* `"default"` ? [`DefaultImageMediaItem`](../interfaces/DefaultImageMediaItem.md) : `T` *extends* `"campaignCoverPhoto"` ? [`CampaignCoverPhotoMediaItem`](../interfaces/CampaignCoverPhotoMediaItem.md) : `T` *extends* `"postCoverImage"` ? [`PostCoverImageMediaItem`](../interfaces/PostCoverImageMediaItem.md) : `T` *extends* `"postThumbnail"` ? [`PostThumbnailMediaItem`](../interfaces/PostThumbnailMediaItem.md) : `never`

Defined in: [src/entities/MediaItem.ts:73](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/entities/MediaItem.ts#L73)

## Type Parameters

### T

`T` *extends* [`ImageType`](ImageType.md)
