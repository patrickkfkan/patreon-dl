[**patreon-dl**](../README.md) • **Docs**

***

[patreon-dl](../README.md) / DeepRequired

# Type Alias: DeepRequired\<T, E\>

> **DeepRequired**\<`T`, `E`\>: `T` *extends* `E` ? `T` : `T` *extends* [infer I] ? [[`DeepRequired`](DeepRequired.md)\<`I`\>] : `T` *extends* infer I[] ? [`DeepRequired`](DeepRequired.md)\<`I`\>[] : `T` *extends* `object` ? `{ [P in keyof T]-?: DeepRequired<T[P]> }` : `T` *extends* `undefined` ? `never` : `T`

## Type Parameters

• **T**

• **E** = [`NoDeepTypes`](NoDeepTypes.md)

## Defined in

[src/utils/Misc.ts:6](https://github.com/patrickkfkan/patreon-dl/blob/0f374425151a1d535f98dea530b43394331b4977/src/utils/Misc.ts#L6)
