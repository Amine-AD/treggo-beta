import { createRoute, z } from '@hono/zod-openapi'
import { createUserSchema, selectUserSchema, updateUserSchema } from '@/db/schema/users'
import { notFoundSchema } from '@/lib/constants'
import createErrorSchema from '@/lib/create-error-schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import IdParamsSchema from '@/lib/id-params'
import jsonContent from '@/lib/json-content'
import jsonContentOneOf from '@/lib/json-content-one-of'
import jsonContentRequired from '@/lib/json-content-required'
import { authMiddleware } from '@/middlewares/auth-middleware'

export const list = createRoute({
  tags: ['Users'],
  method: 'get',
  path: '/users',
  middleware: [...authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: z.array(selectUserSchema),
      }),
      'The user list'
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
  tags: ['Users'],
  method: 'post',
  path: '/users',
  middleware: [...authMiddleware],
  request: {
    body: jsonContentRequired(createUserSchema, 'Create new user'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, 'The created user'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createUserSchema),
      'The validation error(S)'
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      z.object({ message: z.string() }),
      'Resource already exists or conflicts with current state'
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
  tags: ['Users'],
  method: 'get',
  path: '/users/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, 'The user details'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
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
  tags: ['Users'],
  method: 'put',
  path: '/users/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(updateUserSchema, 'Update a user'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, 'The updated user'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(updateUserSchema), createErrorSchema(IdParamsSchema)],
      'The validation error(S)'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
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
  tags: ['Users'],
  method: 'delete',
  path: '/users/{id}',
  middleware: [...authMiddleware],
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Deleted a user',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid id error'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
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
