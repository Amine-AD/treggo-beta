import { testClient } from 'hono/testing'
import { describe, expect, expectTypeOf, it } from 'vitest'

import createApp, { createTestApp } from '@/lib/create-app'

import router from './categories.index'

interface CategoriesResponse {
  data: unknown[]
}

describe('Category list', () => {
  it('responds with an array', async () => {
    const testRouter = createTestApp(router)
    const response = await testRouter.request('/categories')
    const result = (await response.json()) as CategoriesResponse
    console.log(result)
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('responds with an array again', async () => {
    const testApp = createApp()
    const testRouter = testApp.route('/', router)
    const client = testClient(testRouter)
    const response = await client.categories.$get()
    const result = await response.json()
    console.log(result)
    expectTypeOf(result.data).toBeArray()
  })
})
