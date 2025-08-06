import { reset, seed } from 'drizzle-seed'

import db from '..'
import { customers } from '../schema'

export async function seedCustomers() {
  await reset(db as any, { customers })

  await seed(db as any, { customers }).refine(f => ({
    customers: {
      columns: {
        name: f.fullName(),
        address: f.streetAddress(),
        city: f.city(),
        phone: f.phoneNumber({ template: '(###) ###-####' }),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
      count: 10,
    },
  }))
}
