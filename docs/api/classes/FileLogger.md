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
- [getPathInfo](FileLogger.md#getpathinfo)

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

[src/utils/logging/FileLogger.ts:53](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/FileLogger.ts#L53)

## Methods

### end

▸ **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[ConsoleLogger](ConsoleLogger.md).[end](ConsoleLogger.md#end)

#### Defined in

[src/utils/logging/FileLogger.ts:172](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/FileLogger.ts#L172)

___

### getConfig

▸ **getConfig**(): [`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Returns

[`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Overrides

[ConsoleLogger](ConsoleLogger.md).[getConfig](ConsoleLogger.md#getconfig)

#### Defined in

[src/utils/logging/FileLogger.ts:162](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/FileLogger.ts#L162)

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

[src/utils/logging/ConsoleLogger.ts:74](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/ConsoleLogger.ts#L74)

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

[src/utils/logging/ConsoleLogger.ts:87](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/ConsoleLogger.ts#L87)

___

### getPathInfo

▸ **getPathInfo**(`data`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`FileLoggerInit`](../interfaces/FileLoggerInit.md) & `Pick`\<[`FileLoggerOptions`](../interfaces/FileLoggerOptions.md), ``"logLevel"`` \| ``"logDir"`` \| ``"logFilename"``\> |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `created` | `Date` |
| `filePath` | `string` |
| `filename` | `string` |
| `logDir` | `string` |

#### Defined in

[src/utils/logging/FileLogger.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/FileLogger.ts#L71)
