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

[src/downloaders/Bootstrap.ts:19](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/Bootstrap.ts#L19)

___

### targetURL

• **targetURL**: `string`

#### Inherited from

[BootstrapData](BootstrapData.md).[targetURL](BootstrapData.md#targeturl)

#### Defined in

[src/downloaders/Bootstrap.ts:9](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/Bootstrap.ts#L9)

___

### type

• **type**: ``"post"``

#### Overrides

[BootstrapData](BootstrapData.md).[type](BootstrapData.md#type)

#### Defined in

[src/downloaders/Bootstrap.ts:18](https://github.com/patrickkfkan/patreon-dl/blob/980a638/src/downloaders/Bootstrap.ts#L18)
