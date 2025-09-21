[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DeepRequired

# Type Alias: DeepRequired\<T, E\>

> **DeepRequired**\<`T`, `E`\> = `T` *extends* `E` ? `T` : `T` *extends* \[infer I\] ? \[`DeepRequired`\<`I`\>\] : `T` *extends* infer I[] ? `DeepRequired`\<`I`\>[] : `T` *extends* `object` ? `{ [P in keyof T]-?: DeepRequired<T[P]> }` : `T` *extends* `undefined` ? `never` : `T`

Defined in: [src/utils/Misc.ts:7](https://github.com/patrickkfkan/patreon-dl/blob/faebc79e7105b755ed4bb91829b93f102ad3b38c/src/utils/Misc.ts#L7)

## Type Parameters

### T

`T`

### E

`E` = [`NoDeepTypes`](NoDeepTypes.md)
