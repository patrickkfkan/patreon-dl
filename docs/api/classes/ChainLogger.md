[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / ChainLogger

# Class: ChainLogger

## Extends

- [`Logger`](Logger.md)

## Constructors

### new ChainLogger()

> **new ChainLogger**(`loggers`?): [`ChainLogger`](ChainLogger.md)

#### Parameters

• **loggers?**: [`Logger`](Logger.md)[]

#### Returns

[`ChainLogger`](ChainLogger.md)

#### Overrides

[`Logger`](Logger.md).[`constructor`](Logger.md#constructors)

#### Defined in

[src/utils/logging/ChainLogger.ts:7](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/utils/logging/ChainLogger.ts#L7)

## Methods

### add()

> **add**(`logger`): `void`

#### Parameters

• **logger**: [`Logger`](Logger.md)

#### Returns

`void`

#### Defined in

[src/utils/logging/ChainLogger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/utils/logging/ChainLogger.ts#L12)

***

### clear()

> **clear**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/logging/ChainLogger.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/utils/logging/ChainLogger.ts#L23)

***

### end()

> **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Logger`](Logger.md).[`end`](Logger.md#end)

#### Defined in

[src/utils/logging/ChainLogger.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/utils/logging/ChainLogger.ts#L33)

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

[src/utils/logging/ChainLogger.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/utils/logging/ChainLogger.ts#L27)

***

### remove()

> **remove**(`logger`): `void`

#### Parameters

• **logger**: [`Logger`](Logger.md)

#### Returns

`void`

#### Defined in

[src/utils/logging/ChainLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/9af63ff8fb311b0c258b1f0abf6afcc007d73ad0/src/utils/logging/ChainLogger.ts#L16)
