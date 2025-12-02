[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloadTaskSkipReason

# Type Alias: DownloadTaskSkipReason

> **DownloadTaskSkipReason** = `object` & \{ `existingDestFilePath`: `string`; `name`: `"destFileExists"`; \} \| \{ `destFilename`: `string`; `itemType`: `"image"` \| `"audio"` \| `"attachment"`; `name`: `"includeMediaByFilenameUnfulfilled"`; `pattern`: `string`; \} \| \{ `name`: `"dependentTaskNotCompleted"`; \} \| \{ `name`: `"other"`; \}

Defined in: [src/downloaders/task/DownloadTask.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/downloaders/task/DownloadTask.ts#L25)

## Type declaration

### message

> **message**: `string`
