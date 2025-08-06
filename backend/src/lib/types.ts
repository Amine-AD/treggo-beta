import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi'
import type { Schema } from 'hono'
import type { JwtVariables } from 'hono/jwt'
import type { ZodArray, ZodObject, ZodOptional, ZodType, ZodUnion } from 'zod'

type Variables = JwtVariables & { userId: number }

export interface AppBindings {
  Variables: Variables
}

// export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>
// export type AppOpenAPI<S extends Schema = any> = OpenAPIHono<AppBindings, S>
// export type AppOpenAPI<S extends Schema = unknown> = OpenAPIHono<AppBindings, S>
// export type AppOpenAPI<S extends Schema> = OpenAPIHono<AppBindings, S>
export type AppOpenAPI<S extends Schema = Schema> = OpenAPIHono<AppBindings, S>

// export type AppOpenAPI<S extends Schema> = OpenAPIHono<AppBindings, S>

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>

// export type ZodSchema = z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>
type AnyZodUnion = ZodUnion<[ZodType, ZodType]>

export type ZodSchema = AnyZodUnion | ZodObject | ZodOptional | ZodArray<ZodObject>
