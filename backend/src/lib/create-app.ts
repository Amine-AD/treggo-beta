import { OpenAPIHono } from '@hono/zod-openapi'

import { notFound, onError } from '@/middlewares'

import { UNPROCESSABLE_ENTITY } from './http-status-codes'
import type { AppBindings, AppOpenAPI } from './types'

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: (result, c) => {
      console.error('result', result)
      if (!result.success) {
        return c.json(
          {
            success: result.success,
            error: {
              issues: result.error.issues,
              name: result.error.name,
            },
          },
          UNPROCESSABLE_ENTITY
        )
      }
    },
  })
}

export default function createApp() {
  const app = createRouter()
  //   app.use(requestId()).use(serveEmojiFavicon('📝')).use(pinoLogger())

  app.notFound(notFound)
  app.onError(onError)
  return app
}

export function createTestApp(router: AppOpenAPI) {
  return createApp().route('/', router)
}
