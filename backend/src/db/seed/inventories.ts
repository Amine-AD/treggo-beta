import { reset, seed } from 'drizzle-seed'

import db from '..'
import { categories, inventories, products, warehouses } from '../schema'

export async function seedProducts() {
  await reset(db, { products, inventories })

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

  await seed(db, { products, inventories }).refine(f => ({
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
    inventories: {
      count: warehouseIds.length,
      columns: {
        warehouseId: f.valuesFromArray({
          values: warehouseIds,
          isUnique: true,
        }),
        quantityInStock: f.int({
          minValue: 100,
          maxValue: 230,
        }),
        lowStockThreshold: f.default({
          defaultValue: undefined,
        }),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
    },
  }))
}
