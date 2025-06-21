[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / FileLogger

# Class: FileLogger\<T\>

Defined in: [src/utils/logging/FileLogger.ts:74](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/FileLogger.ts#L74)

## Extends

- [`ConsoleLogger`](ConsoleLogger.md)

## Type Parameters

### T

`T` *extends* [`FileLoggerType`](../enumerations/FileLoggerType.md) = [`Downloader`](../enumerations/FileLoggerType.md#downloader)

## Constructors

### Constructor

> **new FileLogger**\<`T`\>(`options`): `FileLogger`\<`T`\>

Defined in: [src/utils/logging/FileLogger.ts:81](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/FileLogger.ts#L81)

#### Parameters

##### options

[`FileLoggerOptions`](../type-aliases/FileLoggerOptions.md)\<`T`\>

#### Returns

`FileLogger`\<`T`\>

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`constructor`](ConsoleLogger.md#constructor)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

Defined in: [src/utils/logging/FileLogger.ts:247](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/FileLogger.ts#L247)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`end`](ConsoleLogger.md#end)

***

### getConfig()

> **getConfig**(): [`FileLoggerConfig`](../type-aliases/FileLoggerConfig.md)\<`T`\>

Defined in: [src/utils/logging/FileLogger.ts:229](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/FileLogger.ts#L229)

#### Returns

[`FileLoggerConfig`](../type-aliases/FileLoggerConfig.md)\<`T`\>

#### Overrides

[`ConsoleLogger`](ConsoleLogger.md).[`getConfig`](ConsoleLogger.md#getconfig)

***

### log()

> **log**(`entry`): `void`

Defined in: [src/utils/logging/ConsoleLogger.ts:75](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/ConsoleLogger.ts#L75)

#### Parameters

##### entry

[`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Inherited from

[`ConsoleLogger`](ConsoleLogger.md).[`log`](ConsoleLogger.md#log)

***

### setLevel()

> **setLevel**(`value`): `void`

Defined in: [src/utils/logging/ConsoleLogger.ts:92](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/ConsoleLogger.ts#L92)

#### Parameters

##### value

[`LogLevel`](../type-aliases/LogLevel.md)

#### Returns

`void`

#### Inherited from

[`ConsoleLogger`](ConsoleLogger.md).[`setLevel`](ConsoleLogger.md#setlevel)

***

### getDefaultConfig()

> `static` **getDefaultConfig**(): `object`

Defined in: [src/utils/logging/FileLogger.ts:233](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/FileLogger.ts#L233)

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

###### include.dateTime

> **dateTime**: `boolean`

###### include.errorStack

> **errorStack**: `boolean`

###### include.level

> **level**: `boolean`

###### include.originator

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

***

### getPathInfo()

> `static` **getPathInfo**\<`T`\>(`type`, `params`): `object`

Defined in: [src/utils/logging/FileLogger.ts:102](https://github.com/patrickkfkan/patreon-dl/blob/21cb889ad3b60a77d2f4678e5262807670e6d9d0/src/utils/logging/FileLogger.ts#L102)

#### Type Parameters

##### T

`T` *extends* [`FileLoggerType`](../enumerations/FileLoggerType.md)

#### Parameters

##### type

`T`

##### params

[`FileLoggerGetPathInfoParams`](../type-aliases/FileLoggerGetPathInfoParams.md)\<`T`\>

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
