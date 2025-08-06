import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

import { orders } from './orders'

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}))

export const selectCustomerSchema = createSelectSchema(customers)

const moroccanPhoneRegex = /^06\d{8}$/

export const insertCustomerSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(1, 'Name is required'),
  address: (schema) => schema.optional(),
  city: (schema) => schema.optional(),
  phone: (schema) => schema.regex(moroccanPhoneRegex, 'Invalid Moroccan phone number').optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateCustomerSchema = createUpdateSchema(customers)
