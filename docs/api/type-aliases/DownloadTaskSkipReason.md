[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloadTaskSkipReason

# Type Alias: DownloadTaskSkipReason

> **DownloadTaskSkipReason** = `object` & \{ `existingDestFilePath`: `string`; `name`: `"destFileExists"`; \} \| \{ `destFilename`: `string`; `itemType`: `"image"` \| `"audio"` \| `"attachment"`; `name`: `"includeMediaByFilenameUnfulfilled"`; `pattern`: `string`; \} \| \{ `name`: `"dependentTaskNotCompleted"`; \} \| \{ `name`: `"other"`; \}

Defined in: [src/downloaders/task/DownloadTask.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/downloaders/task/DownloadTask.ts#L25)

## Type declaration

### message

> **message**: `string`
