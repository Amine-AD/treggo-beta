import bcrypt from 'bcrypt'
import { reset, seed } from 'drizzle-seed'

import db from '..'
import { users } from '../schema'

export async function seedUsers() {
  await reset(db as any, { users: users })

  // Hash the password once
  const plainPassword = 'demo'
  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  const roles = ['super_admin', 'admin', 'sales_agent', 'delivery_staff']

  // Use transform to set the same hashed password for every user
  await seed(db as any, { users }).refine(f => ({
    users: {
      columns: {
        email: f.email(),
        password: f.default({ defaultValue: hashedPassword }),
        phone: f.phoneNumber({ template: '(###) ###-####' }),
        role: f.valuesFromArray({
          values: roles,
        }),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
      count: 10,
    },
  }))
}
