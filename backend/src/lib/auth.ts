import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import env from '@/env'

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRES_IN =
  env.NODE_ENV === 'development'
    ? 60 // 60 seconds for testing
    : 15 * 60 // 15 minutes for production

const REFRESH_TOKEN_EXPIRES_IN =
  env.NODE_ENV === 'development'
    ? 3 * 60 // 2 minutes for testing
    : 7 * 24 * 60 * 60 // 7 days for production

// Helper function to generate tokens
export const generateTokens = async (userId: number) => {
  const now = Math.floor(Date.now() / 1000)
  const accessToken = await sign(
    // { userId, exp: Date.now() + 15 * 60 * 1000 },
    { userId, iat: now, exp: now + ACCESS_TOKEN_EXPIRES_IN }, // expire after 20 seconds
    env.JWT_SECRET
  )
  const refreshToken = await sign(
    // { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 },
    { userId, iat: now, exp: now + REFRESH_TOKEN_EXPIRES_IN }, // expire after 40 seconds
    env.JWT_REFRESH_SECRET
  )

  return { accessToken, refreshToken }
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

const isProduction = env.NODE_ENV === 'production'

export const setAuthCookies = (c: Context, tokens: AuthTokens): void => {
  // Set access token cookie - MATCHES generateTokens expiration
  setCookie(c, 'accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: ACCESS_TOKEN_EXPIRES_IN, // 15 minutes (matches JWT exp)
    path: '/',
  })

  // Set refresh token cookie - MATCHES generateTokens expiration
  setCookie(c, 'refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: REFRESH_TOKEN_EXPIRES_IN, // 7 days (matches JWT exp)
    path: '/',
  })
}

export const clearAuthCookies = (c: Context): void => {
  setCookie(c, 'accessToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: 0,
    path: '/',
  })

  setCookie(c, 'refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: 0,
    path: '/',
  })
}
