[patreon-dl](../README.md) / YouTubeCredentialsCapturer

# Class: YouTubeCredentialsCapturer

## Hierarchy

- `EventEmitter`

  ↳ **`YouTubeCredentialsCapturer`**

## Table of contents

### Constructors

- [constructor](YouTubeCredentialsCapturer.md#constructor)

### Methods

- [abort](YouTubeCredentialsCapturer.md#abort)
- [begin](YouTubeCredentialsCapturer.md#begin)
- [emit](YouTubeCredentialsCapturer.md#emit)
- [off](YouTubeCredentialsCapturer.md#off)
- [on](YouTubeCredentialsCapturer.md#on)
- [once](YouTubeCredentialsCapturer.md#once)

## Constructors

### constructor

• **new YouTubeCredentialsCapturer**(): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.constructor

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:17](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L17)

## Methods

### abort

▸ **abort**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:33](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L33)

___

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:26](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L26)

___

### emit

▸ **emit**(`eventName`, `data`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"pending"`` |
| `data` | [`YouTubeCredentialsPendingInfo`](../interfaces/YouTubeCredentialsPendingInfo.md) |

#### Returns

`boolean`

#### Overrides

EventEmitter.emit

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:68](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L68)

▸ **emit**(`eventName`, `credentials`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"capture"`` |
| `credentials` | `object` |

#### Returns

`boolean`

#### Overrides

EventEmitter.emit

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:69](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L69)

___

### off

▸ **off**(`eventName`, `listener`): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"pending"`` |
| `listener` | (`data`: [`YouTubeCredentialsPendingInfo`](../interfaces/YouTubeCredentialsPendingInfo.md)) => `void` |

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.off

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:62](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L62)

▸ **off**(`eventName`, `listener`): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"capture"`` |
| `listener` | (`credentials`: `object`) => `void` |

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.off

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:63](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L63)

___

### on

▸ **on**(`eventName`, `listener`): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"pending"`` |
| `listener` | (`data`: [`YouTubeCredentialsPendingInfo`](../interfaces/YouTubeCredentialsPendingInfo.md)) => `void` |

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.on

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:50](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L50)

▸ **on**(`eventName`, `listener`): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"capture"`` |
| `listener` | (`credentials`: `object`) => `void` |

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.on

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:51](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L51)

___

### once

▸ **once**(`eventName`, `listener`): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"pending"`` |
| `listener` | (`data`: [`YouTubeCredentialsPendingInfo`](../interfaces/YouTubeCredentialsPendingInfo.md)) => `void` |

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.once

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:56](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L56)

▸ **once**(`eventName`, `listener`): [`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | ``"capture"`` |
| `listener` | (`credentials`: `object`) => `void` |

#### Returns

[`YouTubeCredentialsCapturer`](YouTubeCredentialsCapturer.md)

#### Overrides

EventEmitter.once

#### Defined in

[src/utils/YouTubeCredentialsCapturer.ts:57](https://github.com/patrickkfkan/patreon-dl/blob/47a7410/src/utils/YouTubeCredentialsCapturer.ts#L57)
