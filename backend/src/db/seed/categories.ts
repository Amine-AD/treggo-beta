import { reset, seed } from 'drizzle-seed'

import db from '..'
import { categories } from '../schema'

export async function seedCategories() {
  await reset(db as any, { categories })

  const category = [
    'Electronics & Gadgets',
    'Fashion & Apparel',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Health & Wellness',
    'Toys & Games',
    'Sports & Outdoors',
    'Automotive & Tools',
    'Books & Stationery',
    'Groceries & Gourmet Food',
  ]

  await seed(db as any, { categories }).refine(f => ({
    categories: {
      columns: {
        name: f.valuesFromArray({
          values: category,
          isUnique: true,
        }),
        description: f.loremIpsum(),
        createdAt: f.default({ defaultValue: undefined }),
        updatedAt: f.default({ defaultValue: undefined }),
      },
      count: 10,
    },
  }))
}
