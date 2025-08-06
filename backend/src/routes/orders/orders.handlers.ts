import { eq } from 'drizzle-orm'
import db from '@/db'
import { orders } from '@/db/schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import type { AppRouteHandler } from '@/lib/types'

import type { CreateRoute, GetOneRoute, ListRoute, RemoveRoute, UpdateRoute } from './orders.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  try {
    const data = await db.select().from(orders).all()
    return c.json(
      {
        data,
      },
      HttpStatusCodes.OK
    )
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  try {
    const order = c.req.valid('json')
    const [insertedOrder] = await db.insert(orders).values(order).returning()
    return c.json(insertedOrder, HttpStatusCodes.OK)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param')

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    })

    if (!order) {
      return c.json(
        {
          message: 'Order not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(order, HttpStatusCodes.OK)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param')
    const order = c.req.valid('json')

    const orderList = await db.update(orders).set(order).where(eq(orders.id, id)).returning()

    if (orderList.length === 0) {
      return c.json(
        {
          message: 'Order not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(orderList[0], HttpStatusCodes.OK)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param')

    const result = await db.delete(orders).where(eq(orders.id, id))

    if (result.rowsAffected === 0) {
      return c.json(
        {
          message: 'Order not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.body(null, HttpStatusCodes.NO_CONTENT)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}
