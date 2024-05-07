[patreon-dl](../README.md) / ConsoleLoggerOptions

# Interface: ConsoleLoggerOptions

## Hierarchy

- **`ConsoleLoggerOptions`**

  ↳ [`FileLoggerOptions`](FileLoggerOptions.md)

## Table of contents

### Properties

- [color](ConsoleLoggerOptions.md#color)
- [dateTimeFormat](ConsoleLoggerOptions.md#datetimeformat)
- [enabled](ConsoleLoggerOptions.md#enabled)
- [include](ConsoleLoggerOptions.md#include)
- [logLevel](ConsoleLoggerOptions.md#loglevel)

## Properties

### color

• `Optional` **color**: `boolean`

#### Defined in

[src/utils/logging/ConsoleLogger.ts:24](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/utils/logging/ConsoleLogger.ts#L24)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

#### Defined in

[src/utils/logging/ConsoleLogger.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/utils/logging/ConsoleLogger.ts#L23)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

[src/utils/logging/ConsoleLogger.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/utils/logging/ConsoleLogger.ts#L15)

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

#### Defined in

[src/utils/logging/ConsoleLogger.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/utils/logging/ConsoleLogger.ts#L17)

___

### logLevel

• `Optional` **logLevel**: [`LogLevel`](../README.md#loglevel)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/d381b32/src/utils/logging/ConsoleLogger.ts#L16)
