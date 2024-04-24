[patreon-dl](../README.md) / Logger

# Class: Logger

## Hierarchy

- **`Logger`**

  ↳ [`ChainLogger`](ChainLogger.md)

  ↳ [`ConsoleLogger`](ConsoleLogger.md)

## Table of contents

### Constructors

- [constructor](Logger.md#constructor)

### Methods

- [end](Logger.md#end)
- [log](Logger.md#log)

## Constructors

### constructor

• **new Logger**(): [`Logger`](Logger.md)

#### Returns

[`Logger`](Logger.md)

## Methods

### end

▸ **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/logging/Logger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/Logger.ts#L12)

___

### log

▸ **log**(`entry`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | [`LogEntry`](../interfaces/LogEntry.md) |

#### Returns

`void`

#### Defined in

[src/utils/logging/Logger.ts:10](https://github.com/patrickkfkan/patreon-dl/blob/e9fb122/src/utils/logging/Logger.ts#L10)
