import { relations } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

import { products } from './products'
import { warehouses } from './warehouses'

export const inventories = sqliteTable('inventories', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  productId: integer('productId')
    .references(() => products.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  warehouseId: integer('warehouse_id')
    .references(() => warehouses.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  quantityInStock: integer('quantity_in_stock').notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const inventoriesRelations = relations(inventories, ({ one }) => ({
  product: one(products, {
    fields: [inventories.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [inventories.warehouseId],
    references: [warehouses.id],
  }),
}))

export const selectInventorySchema = createSelectSchema(inventories)

export const insertInventorySchema = createInsertSchema(inventories, {
  productId: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Valid product ID is required',
    }),
  warehouseId: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Valid warehouse ID is required',
    }),
  quantityInStock: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val >= 0, {
      message: 'Quantity must be a non-negative number',
    }),
  lowStockThreshold: (schema) =>
    schema.optional().refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
      message: 'Low stock threshold must be a non-negative number',
    }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateInventorySchema = createUpdateSchema(inventories)
