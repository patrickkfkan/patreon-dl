[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DeepRequired

# Type Alias: DeepRequired\<T, E\>

> **DeepRequired**\<`T`, `E`\> = `T` *extends* `E` ? `T` : `T` *extends* \[infer I\] ? \[`DeepRequired`\<`I`\>\] : `T` *extends* infer I[] ? `DeepRequired`\<`I`\>[] : `T` *extends* `object` ? `{ [P in keyof T]-?: DeepRequired<T[P]> }` : `T` *extends* `undefined` ? `never` : `T`

Defined in: [src/utils/Misc.ts:7](https://github.com/patrickkfkan/patreon-dl/blob/564e431e409ad640819c7b5ad600451c2bd07930/src/utils/Misc.ts#L7)

## Type Parameters

### T

`T`

### E

`E` = [`NoDeepTypes`](NoDeepTypes.md)
