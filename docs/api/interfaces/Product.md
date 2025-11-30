[**patreon-dl**](../README.md)

***

[patreon-dl](../README.md) / Product

# Interface: Product

Defined in: [src/entities/Product.ts:14](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L14)

## Properties

### campaign

> **campaign**: `null` \| [`Campaign`](Campaign.md)

Defined in: [src/entities/Product.ts:47](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L47)

***

### contentMedia

> **contentMedia**: [`Downloadable`](../type-aliases/Downloadable.md)[]

Defined in: [src/entities/Product.ts:46](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L46)

***

### description

> **description**: `null` \| `string`

Defined in: [src/entities/Product.ts:31](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L31)

***

### descriptionText?

> `optional` **descriptionText**: `null` \| `string`

Defined in: [src/entities/Product.ts:37](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L37)

`description` converted to plain text.
Used by FTS.

#### Since

3.5.0

***

### id

> **id**: `string`

Defined in: [src/entities/Product.ts:16](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L16)

***

### isAccessible

> **isAccessible**: `boolean`

Defined in: [src/entities/Product.ts:29](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L29)

***

### name

> **name**: `null` \| `string`

Defined in: [src/entities/Product.ts:30](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L30)

***

### previewMedia

> **previewMedia**: [`Downloadable`](../type-aliases/Downloadable.md)[]

Defined in: [src/entities/Product.ts:45](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L45)

***

### price

> **price**: `null` \| `string`

Defined in: [src/entities/Product.ts:38](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L38)

***

### productType?

> `optional` **productType**: `string`

Defined in: [src/entities/Product.ts:22](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L22)

If `undefined`, assume `ProductType.DigitalCommerce`.

#### Since

3.5.0

***

### publishedAt

> **publishedAt**: `null` \| `string`

Defined in: [src/entities/Product.ts:39](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L39)

***

### raw

> **raw**: `object`

Defined in: [src/entities/Product.ts:48](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L48)

***

### referencedEntityId?

> `optional` **referencedEntityId**: `string`

Defined in: [src/entities/Product.ts:28](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L28)

ID of entity referenced according to `productType` (post or collection)

#### Since

3.5.0

***

### type

> **type**: `"product"`

Defined in: [src/entities/Product.ts:15](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L15)

***

### url

> **url**: `string`

Defined in: [src/entities/Product.ts:44](https://github.com/patrickkfkan/patreon-dl/blob/99df673b92ef4ce3aebc4c26b094ba3e47fad262/src/entities/Product.ts#L44)
