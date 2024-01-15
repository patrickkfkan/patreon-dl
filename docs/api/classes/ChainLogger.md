[patreon-dl](../README.md) / ChainLogger

# Class: ChainLogger

## Hierarchy

- [`Logger`](Logger.md)

  ↳ **`ChainLogger`**

## Table of contents

### Constructors

- [constructor](ChainLogger.md#constructor)

### Methods

- [add](ChainLogger.md#add)
- [clear](ChainLogger.md#clear)
- [end](ChainLogger.md#end)
- [log](ChainLogger.md#log)
- [remove](ChainLogger.md#remove)

## Constructors

### constructor

• **new ChainLogger**(`loggers?`): [`ChainLogger`](ChainLogger.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `loggers?` | [`Logger`](Logger.md)[] |

#### Returns

[`ChainLogger`](ChainLogger.md)

#### Overrides

[Logger](Logger.md).[constructor](Logger.md#constructor)

#### Defined in

[src/utils/logging/ChainLogger.ts:7](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/utils/logging/ChainLogger.ts#L7)

## Methods

### add

▸ **add**(`logger`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `logger` | [`Logger`](Logger.md) |

#### Returns

`void`

#### Defined in

[src/utils/logging/ChainLogger.ts:12](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/utils/logging/ChainLogger.ts#L12)

___

### clear

▸ **clear**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/logging/ChainLogger.ts:23](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/utils/logging/ChainLogger.ts#L23)

___

### end

▸ **end**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[Logger](Logger.md).[end](Logger.md#end)

#### Defined in

[src/utils/logging/ChainLogger.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/utils/logging/ChainLogger.ts#L33)

___

### log

▸ **log**(`entry`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry` | [`LogEntry`](../interfaces/LogEntry.md) |

#### Returns

`void`

#### Overrides

[Logger](Logger.md).[log](Logger.md#log)

#### Defined in

[src/utils/logging/ChainLogger.ts:27](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/utils/logging/ChainLogger.ts#L27)

___

### remove

▸ **remove**(`logger`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `logger` | [`Logger`](Logger.md) |

#### Returns

`void`

#### Defined in

[src/utils/logging/ChainLogger.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/2e8088d/src/utils/logging/ChainLogger.ts#L16)
