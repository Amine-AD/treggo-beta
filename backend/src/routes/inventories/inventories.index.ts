import { createRouter } from '@/lib/create-app'

import * as handlers from './inventories.handlers'
import * as routes from './inventories.routes'

const inventoryRoutes = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.update, handlers.update)
  .openapi(routes.remove, handlers.remove)

export default inventoryRoutes
