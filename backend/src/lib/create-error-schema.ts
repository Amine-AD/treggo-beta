import { z } from '@hono/zod-openapi'

import type { ZodSchema } from './types'

const createErrorSchema = (schema: ZodSchema) => {
  const { error } = schema.safeParse(schema._zod.def.type === 'array' ? [] : {})

  return z.object({
    success: z.boolean().openapi({ example: !error }),
    error: z
      .object({
        issues: z.array(
          z.object({
            code: z.string(),
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string().optional(),
          })
        ),
        name: z.string(),
      })
      .openapi({
        example: error
          ? {
              issues: error.issues,
              name: error.name,
            }
          : undefined,
      }),
  })
}

export default createErrorSchema
