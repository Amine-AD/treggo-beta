import { reset, seed } from 'drizzle-seed'

import db from '..'
import { categories, inventories, products, warehouses } from '../schema'

export async function seedProducts() {
  await reset(db as any, { products, inventories })

  const categoryList = await db.select({ id: categories.id }).from(categories)

  const warehouseList = await db.select({ id: warehouses.id }).from(warehouses)

  if (categoryList.length === 0) {
    throw new Error('Categories not found')
  }

  if (warehouseList.length === 0) {
    throw new Error('Categories not found')
  }

  const categoryIds = categoryList.map(category => category.id)

  const warehouseIds = warehouseList.map(warehouse => warehouse.id)

  await seed(db as any, { products }).refine(f => ({
    products: {
      count: 10,
      columns: {
        sku: f.uuid(),
        description: f.loremIpsum(),
        imageUrl: f.default({ defaultValue: undefined }),
        categoryId: f.valuesFromArray({ values: categoryIds }),
        price: f.number({
          minValue: 5,
          maxValue: 20,
          precision: 100,
        }),
        status: f.default({ defaultValue: undefined }),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
    },
  }))

  const productList = await db.select({ id: products.id }).from(products)

  if (productList.length === 0) {
    throw new Error('Products not found')
  }

  const inventoryRows = productList.flatMap(product =>
    warehouseIds.map(warehouseId => ({
      productId: product.id,
      warehouseId: warehouseId,
      quantityInStock: Math.floor(Math.random() * 130) + 100,
    })),
  )

  await db.insert(inventories).values(inventoryRows)
}
