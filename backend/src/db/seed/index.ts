import { seedCategories } from './categories'
import { seedCustomers } from './customers'
import { seedOrders } from './order'
import { seedProducts } from './products'
import { seedUsers } from './users'
import { seedWarehouses } from './warehouses'

// import { seedProducts } from './products'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('all')) {
    await seedUsers()
    await seedCustomers()
    await seedCategories()
    await seedWarehouses()
    await seedProducts()
    // eslint-disable-next-line no-console
    console.log('✅ All seeds completed successfully!')
  } else {
    for (const arg of args) {
      if (arg === 'users') {
        await seedUsers()
        // eslint-disable-next-line no-console
        console.log('✅ Users seed completed successfully!')
      } else if (arg === 'products') {
        await seedProducts()
        // eslint-disable-next-line no-console
        console.log('✅ Products seed completed successfully!')
      } else if (arg === 'categories') {
        await seedCategories()
        // eslint-disable-next-line no-console
        console.log('✅ Categories seed completed successfully!')
      } else if (arg === 'warehouses') {
        await seedWarehouses()
        // eslint-disable-next-line no-console
        console.log('✅ Warehouses seed completed successfully!')
      } else if (arg === 'customers') {
        await seedCustomers()
        // eslint-disable-next-line no-console
        console.log('✅ Customers seed completed successfully!')
      } else if (arg === 'orders') {
        await seedOrders()
        // eslint-disable-next-line no-console
        console.log('✅ Orders seed completed successfully!')
      } else {
        console.error('Unknown seed target:', arg)
        process.exit(1)
      }
    }
  }
}

main().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error(err.message)
  } else {
    console.error('Unknown error', err)
  }
  process.exit(1)
})
