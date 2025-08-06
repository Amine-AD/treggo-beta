import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

import { inventories } from './inventories'

export const warehouses = sqliteTable('warehouses', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  inventories: many(inventories),
}))

export const selectWarehouseSchema = createSelectSchema(warehouses)

export const insertWarehouseSchema = createInsertSchema(warehouses, {
  name: (schema) => schema.min(1, 'Name is required'),
  address: (schema) => schema.min(1, 'Address is required'),
  city: (schema) => schema.min(1, 'City is required'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateWarehouseSchema = createUpdateSchema(warehouses)
