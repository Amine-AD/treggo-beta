import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { customers } from './customers'
import { products } from './products'
import { users } from './users'

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  orderNumber: text('order_number').notNull().unique(),
  createdBy: integer('user_id')
    .references(() => users.id)
    .notNull(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  status: text('role', {
    enum: ['pending', 'prepared', 'delivered'],
  }).default('pending'),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  orderItems: many(orderItems),
}))

export const selectOrderSchema = createSelectSchema(orders)

export const insertOrderSchema = createInsertSchema(orders, {
  createdBy: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Valid user ID is required',
    }),
  customerId: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Valid customer ID is required',
    }),
  status: (schema) =>
    schema
      .refine((val) => ['pending', 'prepared', 'delivered'].includes(val), {
        message: 'Invalid status value',
      })
      .optional(),
  deliveredAt: (schema) =>
    schema.optional().refine((val) => val === undefined || typeof val === 'number', {
      message: 'Invalid delivery date',
    }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateOrderSchema = createInsertSchema(orders).partial()

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  orderId: integer('order_id')
    .references(() => orders.id)
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const selectOrderItemSchema = createSelectSchema(orderItems)

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  orderId: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Valid order ID is required',
    }),
  productId: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Valid product ID is required',
    }),
  quantity: (schema) =>
    schema.refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Quantity must be at least 1',
    }),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateOrderItemSchema = createUpdateSchema(orderItems).partial()
