import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { INTERNAL_SERVER_ERROR, OK } from '../lib/http-status-codes'

const onError: ErrorHandler = (err, c) => {
  const currentStatus = 'status' in err ? err.status : c.newResponse(null).status
  const statusCode =
    currentStatus !== OK
      ? (currentStatus as ContentfulStatusCode)
      : (INTERNAL_SERVER_ERROR as ContentfulStatusCode)

  // const envCandidate =
  //   c.env && typeof c.env === 'object' && 'NODE_ENV' in c.env ? c.env.NODE_ENV : undefined

  const envCandidate =
    c.env && typeof c.env === 'object' && 'NODE_ENV' in c.env
      ? (c.env as { NODE_ENV?: string }).NODE_ENV
      : undefined

  const env = typeof envCandidate === 'string' ? envCandidate : process.env.NODE_ENV

  return c.json(
    {
      message: err.message,

      stack: env === 'production' ? undefined : err.stack,
    },
    statusCode
  )
}

export default onError
