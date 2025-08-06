import { Scalar } from '@scalar/hono-api-reference'

import packageJSON from '../../package.json' with { type: 'json' }
import type { AppOpenAPI } from './types'

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: 'Ordigo API',
    },
  })

  app.get(
    '/api/reference',
    Scalar({
      theme: 'kepler',
      //   layout: 'classic',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      sources: [{ url: '/doc', title: 'Api' }],
    })
  )
}
