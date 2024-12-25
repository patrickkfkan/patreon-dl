[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / ConsoleLogger

# Class: ConsoleLogger

## Extends

- [`Logger`](Logger.md)

## Extended by

- [`FileLogger`](FileLogger.md)

## Constructors

### new ConsoleLogger()

> **new ConsoleLogger**(`options`?): [`ConsoleLogger`](ConsoleLogger.md)

#### Parameters

• **options?**: [`ConsoleLoggerOptions`](../interfaces/ConsoleLoggerOptions.md)

#### Returns

[`ConsoleLogger`](ConsoleLogger.md)

#### Overrides

[`Logger`](Logger.md).[`constructor`](Logger.md#constructors)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/utils/logging/ConsoleLogger.ts#L55)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Logger`](Logger.md).[`end`](Logger.md#end)

#### Defined in

[src/utils/logging/Logger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/utils/logging/Logger.ts#L12)

***

### getConfig()

> **getConfig**(): `object`

#### Returns

`object`

##### color

> **color**: `boolean`

##### dateTimeFormat

> **dateTimeFormat**: `string`

##### enabled

> **enabled**: `boolean`

##### include

> **include**: `object`

##### include.dateTime

> **dateTime**: `boolean`

##### include.errorStack

> **errorStack**: `boolean`

##### include.level

> **level**: `boolean`

##### include.originator

> **originator**: `boolean`

##### logLevel

> **logLevel**: [`LogLevel`](../type-aliases/LogLevel.md)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:84](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/utils/logging/ConsoleLogger.ts#L84)

***

### log()

> **log**(`entry`): `void`

#### Parameters

• **entry**: [`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Overrides

[`Logger`](Logger.md).[`log`](Logger.md#log)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:75](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/utils/logging/ConsoleLogger.ts#L75)

***

### setLevel()

> **setLevel**(`value`): `void`

#### Parameters

• **value**: [`LogLevel`](../type-aliases/LogLevel.md)

#### Returns

`void`

#### Defined in

[src/utils/logging/ConsoleLogger.ts:88](https://github.com/patrickkfkan/patreon-dl/blob/794996b6269a4df0afea77da4d86f16365f2adf5/src/utils/logging/ConsoleLogger.ts#L88)
