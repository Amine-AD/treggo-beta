import { eq } from 'drizzle-orm'
import { reset, seed } from 'drizzle-seed'

import db from '..'
import {
  customers,
  inventories,
  orderItems,
  orders,
  products,
  users,
} from '../schema'

export async function seedOrders() {
  await reset(db as any, { orders, orderItems })

  const userList = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'sales_agent'))

  const customerList = await db.select({ id: customers.id }).from(customers)

  const productList = await db.query.products.findMany({
    with: {
      inventories: true,
    },
  })

  if (userList.length === 0) {
    throw new Error('Users not found')
  }

  if (customerList.length === 0) {
    throw new Error('Customers not found')
  }

  if (productList.length === 0) {
    throw new Error('Products not found')
  }

  const userIds = userList.map(user => user.id)

  const customerIds = customerList.map(customer => customer.id)

  await seed(db as any, { orders }).refine(f => ({
    orders: {
      count: 10,
      columns: {
        orderNumber: f.uuid(),
        createdBy: f.valuesFromArray({ values: userIds }),
        customerId: f.valuesFromArray({ values: customerIds }),
        status: f.default({ defaultValue: undefined }),
        deliveredAt: f.default({ defaultValue: undefined }),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
    },
  }))

  const orderList = await db.select({ id: orders.id }).from(orders)

  if (orderList.length === 0) {
    throw new Error('Orders not found')
  }

  const orderIds = orderList.map(order => order.id)

  for (const orderId of orderIds) {
    const shuffledProducts = [...productList].sort(() => 0.5 - Math.random())
    const selectedProducts = shuffledProducts.slice(
      0,
      Math.floor(Math.random() * 3) + 2,
    )
    for (const product of selectedProducts) {
      const quantity = Math.floor(Math.random() * 50) + 1
      // Find a matching inventory row
      const inventoryList = product.inventories
      if (!inventoryList.length) continue
      // Check if we have enough stock
      if (inventoryList[0].quantityInStock < quantity) continue
      // Create the order item
      await db.insert(orderItems).values({
        orderId,
        productId: product.id,
        quantity,
      })
      // Update the inventory quantity
      await db
        .update(inventories)
        .set({
          quantityInStock: inventoryList[0].quantityInStock - quantity,
          updatedAt: new Date(),
        })
        .where(eq(inventories.id, inventoryList[0].id))
      // Update local inventoryList to reflect in-memory stock
      inventoryList[0].quantityInStock -= quantity
    }
  }
}
