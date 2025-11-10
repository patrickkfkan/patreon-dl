[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / DeepRequired

# Type Alias: DeepRequired\<T, E\>

> **DeepRequired**\<`T`, `E`\> = `T` *extends* `E` ? `T` : `T` *extends* \[infer I\] ? \[`DeepRequired`\<`I`\>\] : `T` *extends* infer I[] ? `DeepRequired`\<`I`\>[] : `T` *extends* `object` ? `{ [P in keyof T]-?: DeepRequired<T[P]> }` : `T` *extends* `undefined` ? `never` : `T`

Defined in: [src/utils/Misc.ts:8](https://github.com/patrickkfkan/patreon-dl/blob/7690929cb7736c1dae2cc87f10284ea119ba8714/src/utils/Misc.ts#L8)

## Type Parameters

### T

`T`

### E

`E` = [`NoDeepTypes`](NoDeepTypes.md)
