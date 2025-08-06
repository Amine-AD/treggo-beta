import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

import { products } from './products'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  name: text('name').unique().notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const selectCategorySchema = createSelectSchema(categories)

export const insertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.min(1, 'Name is required').max(255, 'Name is too long'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateCategorySchema = createUpdateSchema(categories)
