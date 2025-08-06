// import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
// import env from '@/env'
import configureOpenAPI from './lib/configure-open-api'
import createApp from './lib/create-app'
import { routes } from './routes'

const app = createApp()

console.info('test')

app.use(logger())

// app.use(
//   csrf({
//     // Method 1: Simple origin validation (recommended for most cases)
//     origin:
//       env.NODE_ENV === 'production'
//         ? ['your-domain.com', 'www.your-domain.com'] // Replace with your actual domains
//         : ['localhost:3000', '127.0.0.1:3000'], // Development origins

//     // Method 2: Function-based validation (more flexible)
//     // origin: (origin) => {
//     //   if (env.NODE_ENV === 'development') {
//     //     return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
//     //   }
//     //   return /^https:\/\/(www\.)?your-domain\.com$/.test(origin)
//     // }
//   })
// )

for (const route of routes) {
  app.route('/api/', route)
}

configureOpenAPI(app)

export type AppType = (typeof routes)[number]

export default app
