[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloaderBootstrapData

# Type Alias: DownloaderBootstrapData\<T\>

> **DownloaderBootstrapData**\<`T`\> = `T`\[`"type"`\] *extends* `"product"` ? [`ProductDownloaderBootstrapData`](../interfaces/ProductDownloaderBootstrapData.md) : `T`\[`"type"`\] *extends* `"post"` ? [`PostDownloaderBootstrapData`](../interfaces/PostDownloaderBootstrapData.md) : `never`

Defined in: [src/downloaders/Bootstrap.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/Bootstrap.ts#L47)

## Type Parameters

### T

`T` *extends* [`DownloaderType`](DownloaderType.md)
