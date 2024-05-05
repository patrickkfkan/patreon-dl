[patreon-dl](../README.md) / ConsoleLogger

# Class: ConsoleLogger

## Hierarchy

- [`Logger`](Logger.md)

  ↳ **`ConsoleLogger`**

  ↳↳ [`FileLogger`](FileLogger.md)

## Table of contents

### Constructors

- [constructor](ConsoleLogger.md#constructor)

### Methods

- [end](ConsoleLogger.md#end)
- [getConfig](ConsoleLogger.md#getconfig)
- [log](ConsoleLogger.md#log)
- [setLevel](ConsoleLogger.md#setlevel)

## Constructors

### constructor

• **new ConsoleLogger**(`options?`): [`ConsoleLogger`](ConsoleLogger.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [`ConsoleLoggerOptions`](../interfaces/ConsoleLoggerOptions.md) |

#### Returns

[`ConsoleLogger`](ConsoleLogger.md)

#### Overrides

[Logger](Logger.md).[constructor](Logger.md#constructor)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:54](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/utils/logging/ConsoleLogger.ts#L54)

## Methods

### end

▸ **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[Logger](Logger.md).[end](Logger.md#end)

#### Defined in

[src/utils/logging/Logger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/utils/logging/Logger.ts#L12)

___

### getConfig

▸ **getConfig**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `color` | `boolean` |
| `dateTimeFormat` | `string` |
| `enabled` | `boolean` |
| `include` | \{ dateTime: boolean; level: boolean; originator: boolean; errorStack: boolean; } |
| `logLevel` | [`LogLevel`](../README.md#loglevel) |

#### Defined in

[src/utils/logging/ConsoleLogger.ts:83](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/utils/logging/ConsoleLogger.ts#L83)

___

### log

▸ **log**(`entry`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | [`LogEntry`](../interfaces/LogEntry.md) |

#### Returns

`void`

#### Overrides

[Logger](Logger.md).[log](Logger.md#log)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:74](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/utils/logging/ConsoleLogger.ts#L74)

___

### setLevel

▸ **setLevel**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`LogLevel`](../README.md#loglevel) |

#### Returns

`void`

#### Defined in

[src/utils/logging/ConsoleLogger.ts:87](https://github.com/patrickkfkan/patreon-dl/blob/7326660/src/utils/logging/ConsoleLogger.ts#L87)
