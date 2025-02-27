[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / DownloaderBootstrapData

# Type Alias: DownloaderBootstrapData\<T\>

> **DownloaderBootstrapData**\<`T`\>: `T`\[`"type"`\] *extends* `"product"` ? [`ProductDownloaderBootstrapData`](../interfaces/ProductDownloaderBootstrapData.md) : `T`\[`"type"`\] *extends* `"post"` ? [`PostDownloaderBootstrapData`](../interfaces/PostDownloaderBootstrapData.md) : `never`

## Type Parameters

• **T** *extends* [`DownloaderType`](DownloaderType.md)

## Defined in

[src/downloaders/Bootstrap.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/7c1cd2021db5cdb3733758940f1bc6aab660b08d/src/downloaders/Bootstrap.ts#L37)
