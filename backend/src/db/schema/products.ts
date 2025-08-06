import { relations } from 'drizzle-orm'
import { integer, numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

import { categories } from './categories'
import { inventories } from './inventories'
import { orderItems } from './orders'

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  sku: text('sku').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url', { length: 500 }),
  price: numeric('price').notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  status: text('status', {
    enum: ['draft', 'published', 'stopped', 'archived'],
  }).default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventories: many(inventories),
  orderItems: many(orderItems),
}))

export const selectProductSchema = createSelectSchema(products)

export const insertProductSchema = createInsertSchema(products, {
  sku: (schema) => schema.min(1, 'SKU is required'),
  name: (schema) => schema.min(1, 'Name is required'),
  description: (schema) => schema.optional(),
  imageUrl: (schema) => schema.url('Invalid image URL').optional(),
  price: (schema) =>
    schema.refine((val) => Number(val) > 0, {
      message: 'Price must be a positive number',
    }),
  categoryId: (schema) => schema.optional(),
  status: (schema) =>
    schema
      .refine((val) => ['draft', 'published', 'stopped', 'archived'].includes(val), {
        message: 'Invalid status value',
      })
      .optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateProductSchema = createUpdateSchema(products)
