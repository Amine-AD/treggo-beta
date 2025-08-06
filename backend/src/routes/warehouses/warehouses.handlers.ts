import { eq } from 'drizzle-orm'
import db from '@/db'
import { warehouses } from '@/db/schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import type { AppRouteHandler } from '@/lib/types'

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  RemoveRoute,
  UpdateRoute,
} from './warehouses.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  try {
    const data = await db.select().from(warehouses).all()
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
    const warehouse = c.req.valid('json')
    const [insertedWarehouse] = await db.insert(warehouses).values(warehouse).returning()
    return c.json(insertedWarehouse, HttpStatusCodes.OK)
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

    const warehouse = await db.query.warehouses.findFirst({
      where: eq(warehouses.id, id),
    })

    if (!warehouse) {
      return c.json(
        {
          message: 'Warehouse not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(warehouse, HttpStatusCodes.OK)
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
    const warehouse = c.req.valid('json')

    const warehouseList = await db
      .update(warehouses)
      .set(warehouse)
      .where(eq(warehouses.id, id))
      .returning()

    if (warehouseList.length === 0) {
      return c.json(
        {
          message: 'Warehouse not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(warehouseList[0], HttpStatusCodes.OK)
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

    const result = await db.delete(warehouses).where(eq(warehouses.id, id))

    if (result.rowsAffected === 0) {
      return c.json(
        { message: 'Warehouse not found or already deleted.' },
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
