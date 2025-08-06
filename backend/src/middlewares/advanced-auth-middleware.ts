import { eq } from 'drizzle-orm'
import type { Context, Next } from 'hono'
import type { JwtVariables } from 'hono/jwt'
import { jwt, verify } from 'hono/jwt'
import type { z } from 'zod'
import db from '@/db'
import { users } from '@/db/schema'
import type { selectUserSchema } from '@/db/schema/users'
import env from '@/env'
import * as HttpStatusCodes from '@/lib/http-status-codes'

// Use your existing Drizzle schema for type safety
export type User = z.infer<typeof selectUserSchema>

// Extend Context with JWT payload and user info
export type AuthVariables = JwtVariables & {
  user: User
}

// --- Logging helper (optional) ---
function logAuthFailure(reason: string, details?: any) {
  // Replace with your logger if needed
  console.warn(`[AUTH FAILURE] ${reason}`, details || '')
}

// --- JWT Middlewares ---
export const jwtAccessMiddleware = jwt({
  secret: env.JWT_SECRET,
  cookie: 'accessToken',
  alg: 'HS256',
  customValidate: (payload, c) => {
    // Custom expiry check (optional)
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      logAuthFailure('Access token expired', payload)
      return false
    }
    return true
  },
  onError: (err, c) => {
    logAuthFailure('Access token error', err)
    return c.json({ message: 'Invalid or expired access token.' }, HttpStatusCodes.UNAUTHORIZED)
  },
})

export const jwtRefreshMiddleware = jwt({
  secret: env.JWT_REFRESH_SECRET,
  cookie: 'refreshToken',
  alg: 'HS256',
  onError: (err, c) => {
    logAuthFailure('Refresh token error', err)
    return c.json({ message: 'Invalid or expired refresh token.' }, HttpStatusCodes.UNAUTHORIZED)
  },
})

export const jwtBearerMiddleware = jwt({
  secret: env.JWT_SECRET,
  alg: 'HS256',
  onError: (err, c) => {
    logAuthFailure('Bearer token error', err)
    return c.json({ message: 'Invalid or expired bearer token.' }, HttpStatusCodes.UNAUTHORIZED)
  },
})

// --- User loading middleware with status/role check ---
export const userWithChecksMiddleware = async (c: Context, next: Next) => {
  try {
    const payload = c.get('jwtPayload')
    if (!payload.userId) {
      logAuthFailure('Missing userId in payload', payload)
      return c.json({ message: 'Invalid token payload.' }, HttpStatusCodes.UNAUTHORIZED)
    }
    // Load user from DB
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    })
    if (!user) {
      logAuthFailure('User not found', payload.userId)
      return c.json({ message: 'User not found.' }, HttpStatusCodes.UNAUTHORIZED)
    }
    // Example: check if user is active
    if ('active' in user && user.active === false) {
      logAuthFailure('User inactive', user)
      return c.json({ message: 'Account is inactive.' }, HttpStatusCodes.UNAUTHORIZED)
    }
    // Example: check for required role (customize as needed)
    // if (user.role !== 'admin') {
    //   logAuthFailure('Insufficient role', user)
    //   return c.json({ message: 'Insufficient permissions.' }, HttpStatusCodes.FORBIDDEN)
    // }
    // Attach user to context
    c.set('user', user)
    await next()
  } catch (err) {
    logAuthFailure('Exception in userWithChecksMiddleware', err)
    return c.json({ message: 'Authentication error.' }, HttpStatusCodes.UNAUTHORIZED)
  }
}

// --- Combined examples ---
// For access token protected routes
export const strictAuthMiddleware = [jwtAccessMiddleware, userWithChecksMiddleware]
// For refresh token protected routes
export const refreshAuthMiddleware = [jwtRefreshMiddleware, userWithChecksMiddleware]
// For API clients using Bearer token
export const bearerAuthMiddleware = [jwtBearerMiddleware, userWithChecksMiddleware]
