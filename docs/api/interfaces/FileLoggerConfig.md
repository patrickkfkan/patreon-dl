[patreon-dl](../README.md) / FileLoggerConfig

# Interface: FileLoggerConfig

## Hierarchy

- [`DeepRequired`](../README.md#deeprequired)\<[`FileLoggerOptions`](FileLoggerOptions.md)\>

  ↳ **`FileLoggerConfig`**

## Table of contents

### Properties

- [color](FileLoggerConfig.md#color)
- [created](FileLoggerConfig.md#created)
- [dateTimeFormat](FileLoggerConfig.md#datetimeformat)
- [enabled](FileLoggerConfig.md#enabled)
- [fileExistsAction](FileLoggerConfig.md#fileexistsaction)
- [include](FileLoggerConfig.md#include)
- [logDir](FileLoggerConfig.md#logdir)
- [logFilePath](FileLoggerConfig.md#logfilepath)
- [logFilename](FileLoggerConfig.md#logfilename)
- [logLevel](FileLoggerConfig.md#loglevel)

## Properties

### color

• **color**: `boolean`

#### Inherited from

DeepRequired.color

#### Defined in

[src/utils/logging/ConsoleLogger.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/ConsoleLogger.ts#L24)

___

### created

• **created**: `Date`

#### Defined in

[src/utils/logging/FileLogger.ts:21](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/FileLogger.ts#L21)

___

### dateTimeFormat

• **dateTimeFormat**: `string`

#### Inherited from

DeepRequired.dateTimeFormat

#### Defined in

[src/utils/logging/ConsoleLogger.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/ConsoleLogger.ts#L23)

___

### enabled

• **enabled**: `boolean`

#### Inherited from

DeepRequired.enabled

#### Defined in

[src/utils/logging/ConsoleLogger.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/ConsoleLogger.ts#L15)

___

### fileExistsAction

• **fileExistsAction**: ``"append"`` \| ``"overwrite"``

#### Inherited from

DeepRequired.fileExistsAction

#### Defined in

[src/utils/logging/FileLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/FileLogger.ts#L16)

___

### include

• **include**: [`DeepRequired`](../README.md#deeprequired)\<\{ `dateTime?`: `boolean` ; `errorStack?`: `boolean` ; `level?`: `boolean` ; `originator?`: `boolean`  }\>

#### Inherited from

DeepRequired.include

#### Defined in

[src/utils/logging/ConsoleLogger.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/ConsoleLogger.ts#L17)

___

### logDir

• **logDir**: `string`

#### Inherited from

DeepRequired.logDir

#### Defined in

[src/utils/logging/FileLogger.ts:14](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/FileLogger.ts#L14)

___

### logFilePath

• **logFilePath**: `string`

#### Defined in

[src/utils/logging/FileLogger.ts:20](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/FileLogger.ts#L20)

___

### logFilename

• **logFilename**: `string`

#### Inherited from

DeepRequired.logFilename

#### Defined in

[src/utils/logging/FileLogger.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/FileLogger.ts#L15)

___

### logLevel

• **logLevel**: ``"error"`` \| ``"info"`` \| ``"debug"`` \| ``"warn"``

#### Inherited from

DeepRequired.logLevel

#### Defined in

[src/utils/logging/ConsoleLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/0767bc1/src/utils/logging/ConsoleLogger.ts#L16)
