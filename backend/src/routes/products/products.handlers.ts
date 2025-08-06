import { eq } from 'drizzle-orm'
import db from '@/db'
import { products } from '@/db/schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import type { AppRouteHandler } from '@/lib/types'

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  RemoveRoute,
  UpdateRoute,
} from './products.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  try {
    const data = await db.select().from(products).all()
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
    const product = c.req.valid('json')
    const [insertedProduct] = await db.insert(products).values(product).returning()
    return c.json(insertedProduct, HttpStatusCodes.OK)
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

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return c.json(
        {
          message: 'Product not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(product, HttpStatusCodes.OK)
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
    const product = c.req.valid('json')

    const productList = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning()

    if (productList.length === 0) {
      return c.json(
        {
          message: 'Product not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(productList[0], HttpStatusCodes.OK)
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

    const result = await db.delete(products).where(eq(products.id, id))

    if (result.rowsAffected === 0) {
      return c.json(
        {
          message: 'Product not found or already deleted.',
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
