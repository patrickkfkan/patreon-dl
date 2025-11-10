[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloaderBootstrapData

# Type Alias: DownloaderBootstrapData\<T\>

> **DownloaderBootstrapData**\<`T`\> = `T`\[`"type"`\] *extends* `"product"` ? [`ProductDownloaderBootstrapData`](../interfaces/ProductDownloaderBootstrapData.md) : `T`\[`"type"`\] *extends* `"post"` ? [`PostDownloaderBootstrapData`](../interfaces/PostDownloaderBootstrapData.md) : `never`

Defined in: [src/downloaders/Bootstrap.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/Bootstrap.ts#L37)

## Type Parameters

### T

`T` *extends* [`DownloaderType`](DownloaderType.md)
