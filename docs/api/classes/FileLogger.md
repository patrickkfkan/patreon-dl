[patreon-dl](../README.md) / FileLogger

# Class: FileLogger

## Hierarchy

- [`ConsoleLogger`](ConsoleLogger.md)

  ↳ **`FileLogger`**

## Table of contents

### Constructors

- [constructor](FileLogger.md#constructor)

### Methods

- [end](FileLogger.md#end)
- [getConfig](FileLogger.md#getconfig)
- [log](FileLogger.md#log)
- [setLevel](FileLogger.md#setlevel)

## Constructors

### constructor

• **new FileLogger**(`init`, `options?`): [`FileLogger`](FileLogger.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | [`FileLoggerInit`](../interfaces/FileLoggerInit.md) |
| `options?` | [`FileLoggerOptions`](../interfaces/FileLoggerOptions.md) |

#### Returns

[`FileLogger`](FileLogger.md)

#### Overrides

[ConsoleLogger](ConsoleLogger.md).[constructor](ConsoleLogger.md#constructor)

#### Defined in

src/utils/logging/FileLogger.ts:56

## Methods

### end

▸ **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[ConsoleLogger](ConsoleLogger.md).[end](ConsoleLogger.md#end)

#### Defined in

src/utils/logging/FileLogger.ts:155

___

### getConfig

▸ **getConfig**(): [`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Returns

[`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Overrides

[ConsoleLogger](ConsoleLogger.md).[getConfig](ConsoleLogger.md#getconfig)

#### Defined in

src/utils/logging/FileLogger.ts:145

___

### log

▸ **log**(`entry`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | [`LogEntry`](../interfaces/LogEntry.md) |

#### Returns

`void`

#### Inherited from

[ConsoleLogger](ConsoleLogger.md).[log](ConsoleLogger.md#log)

#### Defined in

src/utils/logging/ConsoleLogger.ts:74

___

### setLevel

▸ **setLevel**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`LogLevel`](../README.md#loglevel) |

#### Returns

`void`

#### Inherited from

[ConsoleLogger](ConsoleLogger.md).[setLevel](ConsoleLogger.md#setlevel)

#### Defined in

src/utils/logging/ConsoleLogger.ts:87
