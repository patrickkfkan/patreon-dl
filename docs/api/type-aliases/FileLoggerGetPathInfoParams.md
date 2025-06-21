[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / FileLoggerGetPathInfoParams

# Type Alias: FileLoggerGetPathInfoParams\<T\>

> **FileLoggerGetPathInfoParams**\<`T`\> = `T` *extends* [`Downloader`](../enumerations/FileLoggerType.md#downloader) ? `Pick`\<[`FileLoggerOptions`](FileLoggerOptions.md)\<`T`\>, `"init"` \| `"logDir"` \| `"logFilename"` \| `"logLevel"`\> : `T` *extends* [`Server`](../enumerations/FileLoggerType.md#server) ? `Pick`\<[`FileLoggerOptions`](FileLoggerOptions.md)\<`T`\>, `"logFilePath"`\> : `never`

Defined in: [src/utils/logging/FileLogger.ts:44](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/FileLogger.ts#L44)

## Type Parameters

### T

`T` *extends* [`FileLoggerType`](../enumerations/FileLoggerType.md)
