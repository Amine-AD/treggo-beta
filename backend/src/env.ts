import { z } from '@hono/zod-openapi'
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'
import type { ZodError } from 'zod'

expand(config())

const envSchema = z
  .object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().default(8080),
    DATABASE_URL: z.string(),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
  })
  .refine((input) => {
    if (input.NODE_ENV === 'production') {
      return !!input.DATABASE_AUTH_TOKEN
    }
    return true
  })

export type EnvType = z.infer<typeof envSchema>

let env: EnvType

try {
  // eslint-disable-next-line no-restricted-properties
  env = envSchema.parse(process.env)
} catch (e) {
  const error = e as ZodError
  console.error('❌ Invalid environment variables:')
  console.error(error.flatten().fieldErrors)
  process.exit(1)
}

export default env
