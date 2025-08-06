import { eq } from 'drizzle-orm'
import db from '@/db'
import { inventories } from '@/db/schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import type { AppRouteHandler } from '@/lib/types'

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  RemoveRoute,
  UpdateRoute,
} from './inventories.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  try {
    const data = await db.select().from(inventories).all()
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
    const inventory = c.req.valid('json')
    const [insertedInventory] = await db.insert(inventories).values(inventory).returning()
    return c.json(insertedInventory, HttpStatusCodes.OK)
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

    const inventory = await db.query.inventories.findFirst({
      where: eq(inventories.id, id),
    })

    if (!inventory) {
      return c.json(
        {
          message: 'Inventory not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(inventory, HttpStatusCodes.OK)
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
    const inventory = c.req.valid('json')

    const inventoryList = await db
      .update(inventories)
      .set(inventory)
      .where(eq(inventories.id, id))
      .returning()

    if (inventoryList.length === 0) {
      return c.json(
        {
          message: 'Inventory not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(inventoryList[0], HttpStatusCodes.OK)
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

    const result = await db.delete(inventories).where(eq(inventories.id, id))

    if (result.rowsAffected === 0) {
      return c.json(
        {
          message: 'Inventory not found or already deleted.',
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
