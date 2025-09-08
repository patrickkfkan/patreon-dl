[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / ConsoleLogger

# Class: ConsoleLogger

Defined in: [src/utils/logging/ConsoleLogger.ts:43](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/ConsoleLogger.ts#L43)

## Extends

- [`Logger`](Logger.md)

## Extended by

- [`FileLogger`](FileLogger.md)

## Constructors

### Constructor

> **new ConsoleLogger**(`options?`): `ConsoleLogger`

Defined in: [src/utils/logging/ConsoleLogger.ts:55](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/ConsoleLogger.ts#L55)

#### Parameters

##### options?

[`ConsoleLoggerOptions`](../interfaces/ConsoleLoggerOptions.md)

#### Returns

`ConsoleLogger`

#### Overrides

[`Logger`](Logger.md).[`constructor`](Logger.md#constructor)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [src/utils/logging/Logger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/Logger.ts#L12)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Logger`](Logger.md).[`end`](Logger.md#end)

***

### getConfig()

> **getConfig**(): `object`

Defined in: [src/utils/logging/ConsoleLogger.ts:84](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/ConsoleLogger.ts#L84)

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

###### include.dateTime

> **dateTime**: `boolean`

###### include.errorStack

> **errorStack**: `boolean`

###### include.level

> **level**: `boolean`

###### include.originator

> **originator**: `boolean`

##### logLevel

> **logLevel**: [`LogLevel`](../type-aliases/LogLevel.md)

***

### log()

> **log**(`entry`): `void`

Defined in: [src/utils/logging/ConsoleLogger.ts:75](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/ConsoleLogger.ts#L75)

#### Parameters

##### entry

[`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Overrides

[`Logger`](Logger.md).[`log`](Logger.md#log)

***

### setLevel()

> **setLevel**(`value`): `void`

Defined in: [src/utils/logging/ConsoleLogger.ts:92](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/ConsoleLogger.ts#L92)

#### Parameters

##### value

[`LogLevel`](../type-aliases/LogLevel.md)

#### Returns

`void`

***

### getDefaultConfig()

> `static` **getDefaultConfig**(): `object`

Defined in: [src/utils/logging/ConsoleLogger.ts:88](https://github.com/patrickkfkan/patreon-dl/blob/4add035452a0337eb07608bde52caecf1dcf43e7/src/utils/logging/ConsoleLogger.ts#L88)

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

###### include.dateTime

> **dateTime**: `boolean`

###### include.errorStack

> **errorStack**: `boolean`

###### include.level

> **level**: `boolean`

###### include.originator

> **originator**: `boolean`

##### logLevel

> **logLevel**: [`LogLevel`](../type-aliases/LogLevel.md)
