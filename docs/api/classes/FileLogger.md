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

[src/utils/logging/FileLogger.ts:53](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/FileLogger.ts#L53)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`end`](ConsoleLogger.md#end)

#### Defined in

[src/utils/logging/FileLogger.ts:180](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/FileLogger.ts#L180)

***

### getConfig()

> **getConfig**(): [`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Returns

[`FileLoggerConfig`](../interfaces/FileLoggerConfig.md)

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`getConfig`](ConsoleLogger.md#getconfig)

#### Defined in

[src/utils/logging/FileLogger.ts:162](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/FileLogger.ts#L162)

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

[src/utils/logging/ConsoleLogger.ts:75](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/ConsoleLogger.ts#L75)

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

[src/utils/logging/ConsoleLogger.ts:92](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/ConsoleLogger.ts#L92)

***

### getDefaultConfig()

> `static` **getDefaultConfig**(): `object`

#### Returns

`object`

##### color

> **color**: `boolean`

##### dateTimeFormat

> **dateTimeFormat**: `string`

##### enabled

> **enabled**: `boolean`

##### fileExistsAction

> **fileExistsAction**: `"append"` \| `"overwrite"`

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

##### logDir

> **logDir**: `string`

##### logFilename

> **logFilename**: `string`

##### logFilePath

> **logFilePath**: `string`

##### logLevel

> **logLevel**: [`LogLevel`](../type-aliases/LogLevel.md)

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`getDefaultConfig`](ConsoleLogger.md#getdefaultconfig)

#### Defined in

[src/utils/logging/FileLogger.ts:166](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/FileLogger.ts#L166)

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

[src/utils/logging/FileLogger.ts:71](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/logging/FileLogger.ts#L71)
