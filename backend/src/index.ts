import { serve } from '@hono/node-server'

import app from '@/app'
import env from '@/env'

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    // Using console.info for logging startup messages is a common practice
    console.info(`Server is running on http://localhost:${info.port.toString()}`)
  }
)
