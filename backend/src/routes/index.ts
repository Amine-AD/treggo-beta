import authRoutes from './auth/auth.index'
import categoryRoutes from './categories/categories.index'
import customerRoutes from './customers/customers.index'
import inventoryRoutes from './inventories/inventories.index'
import orderRoutes from './orders/orders.index'
import productRoutes from './products/products.index'
import userRoutes from './users/users.index'
import warehouseRoutes from './warehouses/warehouses.index'

export const routes = [
  authRoutes,
  userRoutes,
  customerRoutes,
  categoryRoutes,
  productRoutes,
  inventoryRoutes,
  orderRoutes,
  warehouseRoutes,
] as const
