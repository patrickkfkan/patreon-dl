[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DownloadTaskSkipReason

# Type Alias: DownloadTaskSkipReason

> **DownloadTaskSkipReason** = `object` & \{ `existingDestFilePath`: `string`; `name`: `"destFileExists"`; \} \| \{ `destFilename`: `string`; `itemType`: `"image"` \| `"audio"` \| `"attachment"`; `name`: `"includeMediaByFilenameUnfulfilled"`; `pattern`: `string`; \} \| \{ `name`: `"dependentTaskNotCompleted"`; \} \| \{ `name`: `"other"`; \}

Defined in: [src/downloaders/task/DownloadTask.ts:25](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/downloaders/task/DownloadTask.ts#L25)

## Type declaration

### message

> **message**: `string`
