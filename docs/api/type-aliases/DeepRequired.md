[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DeepRequired

# Type Alias: DeepRequired\<T, E\>

> **DeepRequired**\<`T`, `E`\> = `T` *extends* `E` ? `T` : `T` *extends* \[infer I\] ? \[`DeepRequired`\<`I`\>\] : `T` *extends* infer I[] ? `DeepRequired`\<`I`\>[] : `T` *extends* `object` ? `{ [P in keyof T]-?: DeepRequired<T[P]> }` : `T` *extends* `undefined` ? `never` : `T`

Defined in: [src/utils/Misc.ts:10](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/utils/Misc.ts#L10)

## Type Parameters

### T

`T`

### E

`E` = [`NoDeepTypes`](NoDeepTypes.md)
