import { createRoute, z } from '@hono/zod-openapi'
import {
  insertWarehouseSchema,
  selectWarehouseSchema,
  updateWarehouseSchema,
} from '@/db/schema/warehouses'
import { notFoundSchema } from '@/lib/constants'
import createErrorSchema from '@/lib/create-error-schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import IdParamsSchema from '@/lib/id-params'
import jsonContent from '@/lib/json-content'
import jsonContentOneOf from '@/lib/json-content-one-of'
import jsonContentRequired from '@/lib/json-content-required'
import { authMiddleware } from '@/middlewares/auth-middleware'

export const list = createRoute({
  tags: ['Warehouses'],
  method: 'get',
  path: '/warehouses',
  middleware: [...authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: z.array(selectWarehouseSchema),
      }),
      'The warehouse list'
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
  tags: ['Warehouses'],
  method: 'post',
  path: '/warehouses',
  middleware: [...authMiddleware],
  request: {
    body: jsonContentRequired(insertWarehouseSchema, 'Create new warehouse'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectWarehouseSchema, 'The created warehouse'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertWarehouseSchema),
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
  tags: ['Warehouses'],
  method: 'get',
  path: '/warehouses/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectWarehouseSchema, 'The warehouse details'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Warehouse not found'),
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
  tags: ['Warehouses'],
  method: 'put',
  path: '/warehouses/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateWarehouseSchema, 'Update a warehouse'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectWarehouseSchema, 'The updated warehouse'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(updateWarehouseSchema), createErrorSchema(IdParamsSchema)],
      'The validation error(S)'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Warehouse not found'),
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
  tags: ['Warehouses'],
  method: 'delete',
  path: '/warehouses/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Deleted a warehouse',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Warehouse not found'),
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
