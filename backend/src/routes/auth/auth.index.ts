import { createRouter } from '@/lib/create-app'
import * as handlers from './auth.handlers'
import * as routes from './auth.routes'

const authRoutes = createRouter()
  .openapi(routes.getCurrentUser, handlers.getCurrentUser)
  .openapi(routes.login, handlers.login)
  .openapi(routes.logout, handlers.logout)
  .openapi(routes.refreshTokenFn, handlers.refreshTokenFn)

export default authRoutes
