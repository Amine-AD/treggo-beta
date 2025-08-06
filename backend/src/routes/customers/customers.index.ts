import { createRouter } from '@/lib/create-app'

import * as handlers from './customers.handlers'
import * as routes from './customers.routes'

const customerRoutes = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)

export default customerRoutes
