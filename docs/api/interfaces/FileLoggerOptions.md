[patreon-dl](../README.md) / FileLoggerOptions

# Interface: FileLoggerOptions

## Hierarchy

- [`ConsoleLoggerOptions`](ConsoleLoggerOptions.md)

  ↳ **`FileLoggerOptions`**

## Table of contents

### Properties

- [color](FileLoggerOptions.md#color)
- [dateTimeFormat](FileLoggerOptions.md#datetimeformat)
- [enabled](FileLoggerOptions.md#enabled)
- [fileExistsAction](FileLoggerOptions.md#fileexistsaction)
- [include](FileLoggerOptions.md#include)
- [logDir](FileLoggerOptions.md#logdir)
- [logFilename](FileLoggerOptions.md#logfilename)
- [logLevel](FileLoggerOptions.md#loglevel)

## Properties

### color

• `Optional` **color**: `boolean`

#### Inherited from

[ConsoleLoggerOptions](ConsoleLoggerOptions.md).[color](ConsoleLoggerOptions.md#color)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/ConsoleLogger.ts#L24)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

#### Inherited from

[ConsoleLoggerOptions](ConsoleLoggerOptions.md).[dateTimeFormat](ConsoleLoggerOptions.md#datetimeformat)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/ConsoleLogger.ts#L23)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Inherited from

[ConsoleLoggerOptions](ConsoleLoggerOptions.md).[enabled](ConsoleLoggerOptions.md#enabled)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/ConsoleLogger.ts#L15)

___

### fileExistsAction

• `Optional` **fileExistsAction**: ``"append"`` \| ``"overwrite"``

#### Defined in

[src/utils/logging/FileLogger.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/FileLogger.ts#L15)

___

### include

• `Optional` **include**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `dateTime?` | `boolean` |
| `errorStack?` | `boolean` |
| `level?` | `boolean` |
| `originator?` | `boolean` |

#### Inherited from

[ConsoleLoggerOptions](ConsoleLoggerOptions.md).[include](ConsoleLoggerOptions.md#include)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/ConsoleLogger.ts#L17)

___

### logDir

• `Optional` **logDir**: `string`

#### Defined in

[src/utils/logging/FileLogger.ts:13](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/FileLogger.ts#L13)

___

### logFilename

• `Optional` **logFilename**: `string`

#### Defined in

[src/utils/logging/FileLogger.ts:14](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/FileLogger.ts#L14)

___

### logLevel

• `Optional` **logLevel**: [`LogLevel`](../README.md#loglevel)

#### Inherited from

[ConsoleLoggerOptions](ConsoleLoggerOptions.md).[logLevel](ConsoleLoggerOptions.md#loglevel)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/logging/ConsoleLogger.ts#L16)
