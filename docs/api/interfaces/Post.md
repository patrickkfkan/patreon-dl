[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / Post

# Interface: Post

Defined in: [src/entities/Post.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L21)

## Properties

### attachments

> **attachments**: [`Downloadable`](../type-aliases/Downloadable.md)\<[`AttachmentMediaItem`](AttachmentMediaItem.md)\>[]

Defined in: [src/entities/Post.ts:81](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L81)

***

### audio

> **audio**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`AudioMediaItem`](AudioMediaItem.md)\>

Defined in: [src/entities/Post.ts:94](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L94)

***

### audioPreview

> **audioPreview**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`AudioMediaItem`](AudioMediaItem.md)\>

Defined in: [src/entities/Post.ts:100](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L100)

***

### campaign

> **campaign**: `null` \| [`Campaign`](Campaign.md)

Defined in: [src/entities/Post.ts:123](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L123)

***

### collections?

> `optional` **collections**: [`Collection`](Collection.md)[]

Defined in: [src/entities/Post.ts:64](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L64)

#### Since

3.5.0

***

### commentCount

> **commentCount**: `number`

Defined in: [src/entities/Post.ts:56](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L56)

***

### content

> **content**: `null` \| `string`

Defined in: [src/entities/Post.ts:46](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L46)

***

### contentText?

> `optional` **contentText**: `null` \| `string`

Defined in: [src/entities/Post.ts:52](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L52)

`content` converted to plain text.
Used by FTS.

#### Since

3.5.0

***

### coverImage

> **coverImage**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`PostCoverImageMediaItem`](PostCoverImageMediaItem.md)\>

Defined in: [src/entities/Post.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L57)

***

### editedAt

> **editedAt**: `null` \| `string`

Defined in: [src/entities/Post.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L55)

***

### embed

> **embed**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`PostEmbed`](PostEmbed.md)\>

Defined in: [src/entities/Post.ts:75](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L75)

***

### id

> **id**: `string`

Defined in: [src/entities/Post.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L23)

***

### images

> **images**: [`Downloadable`](../type-aliases/Downloadable.md)\<[`DefaultImageMediaItem`](DefaultImageMediaItem.md)\>[]

Defined in: [src/entities/Post.ts:106](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L106)

***

### isViewable

> **isViewable**: `boolean`

Defined in: [src/entities/Post.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L43)

***

### linkedAttachments?

> `optional` **linkedAttachments**: [`LinkedAttachment`](../type-aliases/LinkedAttachment.md)[]

Defined in: [src/entities/Post.ts:88](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L88)

***

### postType

> **postType**: `string`

Defined in: [src/entities/Post.ts:42](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L42)

***

### publishedAt

> **publishedAt**: `null` \| `string`

Defined in: [src/entities/Post.ts:54](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L54)

***

### raw

> **raw**: `object`

Defined in: [src/entities/Post.ts:125](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L125)

***

### tags?

> `optional` **tags**: [`PostTag`](PostTag.md)[]

Defined in: [src/entities/Post.ts:69](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L69)

#### Since

3.5.0

***

### teaserText

> **teaserText**: `null` \| `string`

Defined in: [src/entities/Post.ts:53](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L53)

***

### thumbnail

> **thumbnail**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`PostThumbnailMediaItem`](PostThumbnailMediaItem.md)\>

Defined in: [src/entities/Post.ts:58](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L58)

***

### tiers

> **tiers**: [`Tier`](../type-aliases/Tier.md)[]

Defined in: [src/entities/Post.ts:59](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L59)

***

### title

> **title**: `null` \| `string`

Defined in: [src/entities/Post.ts:45](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L45)

***

### type

> **type**: `"post"`

Defined in: [src/entities/Post.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L22)

***

### url

> **url**: `null` \| `string`

Defined in: [src/entities/Post.ts:44](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L44)

***

### video

> **video**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`VideoMediaItem`](VideoMediaItem.md)\>

Defined in: [src/entities/Post.ts:121](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L121)

***

### videoPreview

> **videoPreview**: `null` \| [`Downloadable`](../type-aliases/Downloadable.md)\<[`VideoMediaItem`](VideoMediaItem.md)\>

Defined in: [src/entities/Post.ts:113](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Post.ts#L113)
