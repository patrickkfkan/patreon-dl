[patreon-dl](../README.md) / PostDownloaderBootstrapData

# Interface: PostDownloaderBootstrapData

## Hierarchy

- [`BootstrapData`](BootstrapData.md)

  ↳ **`PostDownloaderBootstrapData`**

## Table of contents

### Properties

- [postFetch](PostDownloaderBootstrapData.md#postfetch)
- [targetURL](PostDownloaderBootstrapData.md#targeturl)
- [type](PostDownloaderBootstrapData.md#type)

## Properties

### postFetch

• **postFetch**: \{ `postId`: `string` ; `type`: ``"single"``  } \| \{ `filters?`: `Record`\<`string`, `any`\> ; `type`: ``"byUser"`` ; `vanity`: `string`  } \| \{ `collectionId`: `string` ; `filters?`: `Record`\<`string`, `any`\> ; `type`: ``"byCollection"``  }

#### Defined in

[src/downloaders/Bootstrap.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Bootstrap.ts#L17)

___

### targetURL

• **targetURL**: `string`

#### Inherited from

[BootstrapData](BootstrapData.md).[targetURL](BootstrapData.md#targeturl)

#### Defined in

[src/downloaders/Bootstrap.ts:7](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Bootstrap.ts#L7)

___

### type

• **type**: ``"post"``

#### Overrides

[BootstrapData](BootstrapData.md).[type](BootstrapData.md#type)

#### Defined in

[src/downloaders/Bootstrap.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/downloaders/Bootstrap.ts#L16)
