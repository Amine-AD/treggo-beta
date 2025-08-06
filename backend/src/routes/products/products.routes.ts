import { createRoute, z } from '@hono/zod-openapi'
import { insertProductSchema, selectProductSchema, updateProductSchema } from '@/db/schema/products'
import { notFoundSchema } from '@/lib/constants'
import createErrorSchema from '@/lib/create-error-schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import IdParamsSchema from '@/lib/id-params'
import jsonContent from '@/lib/json-content'
import jsonContentOneOf from '@/lib/json-content-one-of'
import jsonContentRequired from '@/lib/json-content-required'
import { authMiddleware } from '@/middlewares/auth-middleware'

export const list = createRoute({
  tags: ['Products'],
  method: 'get',
  path: '/products',
  middleware: [...authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: z.array(selectProductSchema),
      }),
      'The product list'
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ message: z.string() }),
      'Bad request error'
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error'
    ),
  },
})

export const create = createRoute({
  tags: ['Products'],
  method: 'post',
  path: '/products',
  middleware: [...authMiddleware],
  request: {
    body: jsonContentRequired(insertProductSchema, 'Create new product'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductSchema, 'The created product'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProductSchema),
      'The validation error(S)'
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error'
    ),
  },
})

export const getOne = createRoute({
  tags: ['Products'],
  method: 'get',
  path: '/products/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductSchema, 'The product details'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Product not found'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error'
    ),
  },
})

export const update = createRoute({
  tags: ['Products'],
  method: 'put',
  path: '/products/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateProductSchema, 'Update a product'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductSchema, 'The updated product'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(updateProductSchema), createErrorSchema(IdParamsSchema)],
      'The validation error(S)'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Product not found'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error'
    ),
  },
})

export const remove = createRoute({
  tags: ['Products'],
  method: 'delete',
  path: '/products/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Deleted a product',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Product not found'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error'
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type GetOneRoute = typeof getOne
export type UpdateRoute = typeof update
export type RemoveRoute = typeof remove
