import { createRoute, z } from '@hono/zod-openapi'
import { insertOrderSchema, selectOrderSchema, updateOrderSchema } from '@/db/schema/orders'
import { notFoundSchema } from '@/lib/constants'
import createErrorSchema from '@/lib/create-error-schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import IdParamsSchema from '@/lib/id-params'
import jsonContent from '@/lib/json-content'
import jsonContentOneOf from '@/lib/json-content-one-of'
import jsonContentRequired from '@/lib/json-content-required'
import { authMiddleware } from '@/middlewares/auth-middleware'

export const list = createRoute({
  tags: ['Orders'],
  method: 'get',
  path: '/orders',
  middleware: [...authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: z.array(selectOrderSchema),
      }),
      'The order list'
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
  tags: ['Orders'],
  method: 'post',
  path: '/orders',
  middleware: [...authMiddleware],
  request: {
    body: jsonContentRequired(insertOrderSchema, 'Create new order'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrderSchema, 'The created order'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertOrderSchema),
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
  tags: ['Orders'],
  method: 'get',
  path: '/orders/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrderSchema, 'The order details'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Order not found'),
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
  tags: ['Orders'],
  method: 'put',
  path: '/orders/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateOrderSchema, 'Update an order'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectOrderSchema, 'The updated order'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(updateOrderSchema), createErrorSchema(IdParamsSchema)],
      'The validation error(S)'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Order not found'),
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
  tags: ['Orders'],
  method: 'delete',
  path: '/orders/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Deleted a order',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Order not found'),
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
