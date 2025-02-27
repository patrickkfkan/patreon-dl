[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / ImageMediaItem

# Type Alias: ImageMediaItem\<T\>

> **ImageMediaItem**\<`T`\>: `T` *extends* `"single"` ? [`SingleImageMediaItem`](../interfaces/SingleImageMediaItem.md) : `T` *extends* `"default"` ? [`DefaultImageMediaItem`](../interfaces/DefaultImageMediaItem.md) : `T` *extends* `"campaignCoverPhoto"` ? [`CampaignCoverPhotoMediaItem`](../interfaces/CampaignCoverPhotoMediaItem.md) : `T` *extends* `"postCoverImage"` ? [`PostCoverImageMediaItem`](../interfaces/PostCoverImageMediaItem.md) : `T` *extends* `"postThumbnail"` ? [`PostThumbnailMediaItem`](../interfaces/PostThumbnailMediaItem.md) : `never`

## Type Parameters

• **T** *extends* [`ImageType`](ImageType.md)

## Defined in

[src/entities/MediaItem.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/7c1cd2021db5cdb3733758940f1bc6aab660b08d/src/entities/MediaItem.ts#L71)
