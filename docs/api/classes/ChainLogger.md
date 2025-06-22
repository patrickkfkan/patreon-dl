[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / ChainLogger

# Class: ChainLogger

Defined in: [src/utils/logging/ChainLogger.ts:3](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L3)

## Extends

- [`Logger`](Logger.md)

## Constructors

### Constructor

> **new ChainLogger**(`loggers?`): `ChainLogger`

Defined in: [src/utils/logging/ChainLogger.ts:7](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L7)

#### Parameters

##### loggers?

[`Logger`](Logger.md)[]

#### Returns

`ChainLogger`

#### Overrides

[`Logger`](Logger.md).[`constructor`](Logger.md#constructor)

## Methods

### add()

> **add**(`logger`): `void`

Defined in: [src/utils/logging/ChainLogger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L12)

#### Parameters

##### logger

[`Logger`](Logger.md)

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/utils/logging/ChainLogger.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L23)

#### Returns

`void`

***

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [src/utils/logging/ChainLogger.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L33)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Logger`](Logger.md).[`end`](Logger.md#end)

***

### log()

> **log**(`entry`): `void`

Defined in: [src/utils/logging/ChainLogger.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L27)

#### Parameters

##### entry

[`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Overrides

[`Logger`](Logger.md).[`log`](Logger.md#log)

***

### remove()

> **remove**(`logger`): `void`

Defined in: [src/utils/logging/ChainLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/4dbe5b7f9bc86c654049194392d94f0aeefc44c0/src/utils/logging/ChainLogger.ts#L16)

#### Parameters

##### logger

[`Logger`](Logger.md)

#### Returns

`void`
