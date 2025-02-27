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

[src/utils/logging/Logger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/7c1cd2021db5cdb3733758940f1bc6aab660b08d/src/utils/logging/Logger.ts#L12)

***

### log()

> `abstract` **log**(`entry`): `void`

#### Parameters

• **entry**: [`LogEntry`](../interfaces/LogEntry.md)

#### Returns

`void`

#### Defined in

[src/utils/logging/Logger.ts:10](https://github.com/patrickkfkan/patreon-dl/blob/7c1cd2021db5cdb3733758940f1bc6aab660b08d/src/utils/logging/Logger.ts#L10)
