[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / PostDownloaderBootstrapData

# Interface: PostDownloaderBootstrapData

Defined in: [src/downloaders/Bootstrap.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Bootstrap.ts#L24)

## Extends

- [`BootstrapData`](BootstrapData.md)

## Properties

### postFetch

> **postFetch**: \{ `postId`: `string`; `type`: `"single"`; \} \| \{ `campaignId?`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"byUser"`; `vanity`: `string`; \} \| \{ `campaignId?`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"byUserId"`; `userId`: `string`; \} \| \{ `campaignId?`: `string`; `collectionId`: `string`; `filters?`: `Record`\<`string`, `any`\>; `type`: `"byCollection"`; \}

Defined in: [src/downloaders/Bootstrap.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Bootstrap.ts#L26)

***

### targetURL

> **targetURL**: `string`

Defined in: [src/downloaders/Bootstrap.ts:9](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Bootstrap.ts#L9)

#### Inherited from

[`BootstrapData`](BootstrapData.md).[`targetURL`](BootstrapData.md#targeturl)

***

### type

> **type**: `"post"`

Defined in: [src/downloaders/Bootstrap.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Bootstrap.ts#L25)

#### Overrides

[`BootstrapData`](BootstrapData.md).[`type`](BootstrapData.md#type)
