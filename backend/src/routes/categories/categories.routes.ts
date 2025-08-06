import { createRoute, z } from '@hono/zod-openapi'
import {
  insertCategorySchema,
  selectCategorySchema,
  updateCategorySchema,
} from '@/db/schema/categories'
import { notFoundSchema } from '@/lib/constants'
import createErrorSchema from '@/lib/create-error-schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import IdParamsSchema from '@/lib/id-params'
import jsonContent from '@/lib/json-content'
import jsonContentOneOf from '@/lib/json-content-one-of'
import jsonContentRequired from '@/lib/json-content-required'
import { authMiddleware } from '@/middlewares/auth-middleware'

export const list = createRoute({
  tags: ['Categories'],
  method: 'get',
  path: '/categories',
  middleware: [...authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: z.array(selectCategorySchema),
      }),
      'The category list'
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
  tags: ['Categories'],
  method: 'post',
  path: '/categories',
  middleware: [...authMiddleware],
  request: {
    body: jsonContentRequired(insertCategorySchema, 'Create new category'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCategorySchema, 'The created category'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertCategorySchema),
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
  tags: ['Categories'],
  method: 'get',
  path: '/categories/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCategorySchema, 'The category details'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Category not found'),
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
  tags: ['Categories'],
  method: 'put',
  path: '/categories/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateCategorySchema, 'Update a category'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectCategorySchema, 'The updated category'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(updateCategorySchema), createErrorSchema(IdParamsSchema)],
      'The validation error(S)'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Category not found'),
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
  tags: ['Categories'],
  method: 'delete',
  path: '/categories/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Deleted a category',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Category not found'),
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
