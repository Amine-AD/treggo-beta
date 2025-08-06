import { eq } from 'drizzle-orm'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import type { JwtVariables } from 'hono/jwt'
import { verify } from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'
import type { z } from 'zod'
import db from '@/db'
import { users } from '@/db/schema'
import type { selectUserSchema } from '@/db/schema/users'
import env from '@/env'
import * as HttpStatusCodes from '@/lib/http-status-codes'

// Use your existing Drizzle schema for type safety
type User = z.infer<typeof selectUserSchema>

// Extend Context with JWT payload and user info
export type AuthVariables = JwtVariables & {
  user: User
}

// // Hono's built-in JWT middleware for cookie-based auth (ACCESS TOKEN)
// export const jwtMiddleware = jwt({
//   secret: env.JWT_SECRET, // Use your existing JWT_SECRET
//   cookie: 'accessToken', // Read from HTTP-only cookie
//   alg: 'HS256',
// })

// // Custom JWT middleware that returns JSON errors instead of throwing
export const jwtMiddleware = async (c: Context, next: Next) => {
  try {
    const accessToken = getCookie(c, 'accessToken')

    if (!accessToken) {
      return c.json(
        {
          message: 'Authentication token is missing. Please login to access this resource.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    const payload = (await verify(accessToken, env.JWT_SECRET)) as JWTPayload & { userId: number }
    c.set('jwtPayload', payload)

    await next()
  } catch (error) {
    console.error('Access token error:', error)
    if (error instanceof Error && error.message.includes('exp')) {
      return c.json(
        {
          message: 'Authentication token has expired. Please login again.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    return c.json(
      {
        message: 'Invalid authentication token. Please login again.',
      },
      HttpStatusCodes.UNAUTHORIZED
    )
  }
}

// // Alternative: For refresh token validation
// export const refreshTokenMiddleware = jwt({
//   secret: env.JWT_REFRESH_SECRET, // Use your existing JWT_REFRESH_SECRET
//   cookie: 'refreshToken',
//   alg: 'HS256',
// })

// For refresh token validation
export const refreshTokenMiddleware = async (c: Context, next: Next) => {
  try {
    const refreshToken = getCookie(c, 'refreshToken')

    if (!refreshToken) {
      return c.json(
        {
          message: 'Refresh token is missing. Please login again.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    const payload = (await verify(refreshToken, env.JWT_REFRESH_SECRET)) as JWTPayload & {
      userId: number
    }
    c.set('jwtPayload', payload)

    await next()
  } catch (error) {
    console.error('Refresh token error:', error)
    return c.json(
      {
        message: 'Invalid or expired refresh token. Please login again.',
      },
      HttpStatusCodes.UNAUTHORIZED
    )
  }
}

// // Alternative: For Authorization header (Bearer token) instead of cookies
// export const bearerAuthMiddleware = jwt({
//   secret: env.JWT_SECRET, // Use your existing JWT_SECRET
//   // No cookie option = reads from Authorization header
//   alg: 'HS256',
// })

// For Authorization header (Bearer token)
export const bearerAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return c.json(
        {
          message:
            'Authorization header is missing or invalid. Please provide a valid bearer token.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    const token = authHeader.substring(7)
    const payload = (await verify(token, env.JWT_SECRET)) as JWTPayload & { userId: string }
    c.set('jwtPayload', payload)

    await next()
  } catch (error) {
    console.error('Bearer token error:', error)
    return c.json(
      {
        message: 'Invalid or expired authorization token.',
      },
      HttpStatusCodes.UNAUTHORIZED
    )
  }
}

// Custom middleware to load user data after JWT validation
export const userMiddleware = async (c: Context, next: Next) => {
  try {
    // Get JWT payload (automatically set by Hono's jwt middleware)
    const payload = c.get('jwtPayload') as { userId: number; exp: number; iat: number }

    if (!payload.userId) {
      return c.json(
        {
          message: 'Invalid token payload. Please login again.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    // Load user from database using your Drizzle schema
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      // This will automatically exclude password due to selectUserSchema.omit({ password: true })
    })

    if (!user) {
      return c.json(
        {
          message: 'User account not found. Please login again.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    if (!user.isActive) {
      return c.json(
        {
          message: 'Your account has been deactivated. Please contact support for assistance.',
        },
        HttpStatusCodes.FORBIDDEN
      )
    }

    // Set user in context
    c.set('user', user)

    await next()
  } catch (error) {
    console.error('User middleware error:', error)
    return c.json(
      {
        message: 'Authentication verification failed. Please try again.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

// Combined auth middleware (JWT + User loading) - Use this for all protected routes
export const authMiddleware = [jwtMiddleware, userMiddleware]
