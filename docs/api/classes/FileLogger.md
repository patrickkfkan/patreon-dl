[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / FileLogger

# Class: FileLogger

## Extends

- [`ConsoleLogger`](ConsoleLogger.md)

## Constructors

### new FileLogger()

> **new FileLogger**(`init`, `options`?): [`FileLogger`](FileLogger.md)

#### Parameters

• **init**: [`FileLoggerInit`](../interfaces/FileLoggerInit.md)

• **options?**: [`FileLoggerOptions`](../interfaces/FileLoggerOptions.md)

#### Returns

[`FileLogger`](FileLogger.md)

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`constructor`](ConsoleLogger.md#constructors)

#### Defined in

[src/utils/logging/FileLogger.ts:53](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/FileLogger.ts#L53)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`end`](ConsoleLogger.md#end)

#### Defined in

[src/utils/logging/FileLogger.ts:172](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/FileLogger.ts#L172)

***

### getConfig()

> **getConfig**(): [`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Returns

[`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`getConfig`](ConsoleLogger.md#getconfig)

#### Defined in

[src/utils/logging/FileLogger.ts:162](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/FileLogger.ts#L162)

***

### log()

> **log**(`entry`): `void`

#### Parameters

• **entry**: [`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Inherited from

[`ConsoleLogger`](ConsoleLogger.md).[`log`](ConsoleLogger.md#log)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:74](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/ConsoleLogger.ts#L74)

***

### setLevel()

> **setLevel**(`value`): `void`

#### Parameters

• **value**: [`LogLevel`](../type-aliases/LogLevel.md)

#### Returns

`void`

#### Inherited from

[`ConsoleLogger`](ConsoleLogger.md).[`setLevel`](ConsoleLogger.md#setlevel)

#### Defined in

[src/utils/logging/ConsoleLogger.ts:87](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/ConsoleLogger.ts#L87)

***

### getPathInfo()

> `static` **getPathInfo**(`data`): `object`

#### Parameters

• **data**: [`FileLoggerInit`](../interfaces/FileLoggerInit.md) & `Pick`\<[`FileLoggerOptions`](../interfaces/FileLoggerOptions.md), `"logLevel"` \| `"logDir"` \| `"logFilename"`\>

#### Returns

`object`

##### created

> **created**: `Date`

##### filename

> **filename**: `string`

##### filePath

> **filePath**: `string`

##### logDir

> **logDir**: `string`

#### Defined in

[src/utils/logging/FileLogger.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/FileLogger.ts#L71)
