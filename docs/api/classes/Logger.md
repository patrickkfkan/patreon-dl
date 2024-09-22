[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / Logger

# Class: `abstract` Logger

## Extended by

- [`ChainLogger`](ChainLogger.md)
- [`ConsoleLogger`](ConsoleLogger.md)

## Constructors

### new Logger()

> **new Logger**(): [`Logger`](Logger.md)

#### Returns

[`Logger`](Logger.md)

## Methods

### end()

> **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/logging/Logger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/Logger.ts#L12)

***

### log()

> `abstract` **log**(`entry`): `void`

#### Parameters

• **entry**: [`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Defined in

[src/utils/logging/Logger.ts:10](https://github.com/patrickkfkan/patreon-dl/blob/3799c917b21e82ba47bd4fda974130f074846e4a/src/utils/logging/Logger.ts#L10)
