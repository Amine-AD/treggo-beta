import { reset, seed } from 'drizzle-seed'

import db from '..'
import { warehouses } from '../schema'

export async function seedWarehouses() {
  await reset(db as any, { warehouses })

  await seed(db as any, { warehouses }).refine(f => ({
    warehouses: {
      columns: {
        city: f.city(),
        address: f.streetAddress(),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
      count: 2,
    },
  }))
}
