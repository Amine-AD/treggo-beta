import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import db from '@/db'
import { users } from '@/db/schema'
import { clearAuthCookies, generateTokens, setAuthCookies } from '@/lib/auth'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import type { AppRouteHandler } from '@/lib/types'
import type { GetCurrentUserRoute, LoginRoute, LogoutRoute, RefreshTokenRoute } from './auth.routes'

// Get current user handler
export const getCurrentUser: AppRouteHandler<GetCurrentUserRoute> = async (c) => {
  try {
    const payload = c.get('jwtPayload')

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    })

    // User not found in database
    if (!user) {
      // Clear cookies
      clearAuthCookies(c)
      return c.json(
        {
          message: 'User account no longer exists. Please contact support if this is unexpected.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    // Check if user account is active
    if (!user.isActive) {
      // Clear cookies
      clearAuthCookies(c)
      return c.json(
        {
          message: 'Your account has been deactivated. Please contact support for assistance.',
        },
        HttpStatusCodes.FORBIDDEN
      )
    }

    const { password: _, ...userWithoutPassword } = user

    return c.json({ data: userWithoutPassword }, HttpStatusCodes.OK)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

// Login handler
export const login: AppRouteHandler<LoginRoute> = async (c) => {
  try {
    const { identifier, password } = c.req.valid('json')

    // Find user by email or phone number
    const user = await db.query.users.findFirst({
      where: or(eq(users.email, identifier), eq(users.phoneNumber, identifier)),
    })

    // User not found - use generic message for security
    if (!user) {
      return c.json(
        {
          message: 'Invalid email/phone or password. Please check your credentials.',
        },
        HttpStatusCodes.UNAUTHORIZED
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return c.json(
        {
          message: 'Invalid email/phone or password. Please check your credentials.',
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

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id)

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))

    // Set HTTP-only cookies for tokens
    setAuthCookies(c, { accessToken, refreshToken })

    return c.json({ message: 'Login successful' }, HttpStatusCodes.OK)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

// Logout handler
export const logout: AppRouteHandler<LogoutRoute> = (c) => {
  try {
    clearAuthCookies(c)

    return c.json({ message: 'Logout successful' }, HttpStatusCodes.OK)
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error:', error)
    return c.json(
      {
        message: 'An unexpected error occurred. Please try again later.',
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

// Refresh token handler
export const refreshTokenFn: AppRouteHandler<RefreshTokenRoute> = async (c) => {
  const payload = c.get('jwtPayload')

  if (!payload?.userId) {
    clearAuthCookies(c)
    return c.json({ message: 'Invalid or expired refresh token' }, HttpStatusCodes.UNAUTHORIZED)
  }

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  })

  if (!user?.isActive) {
    // Clear cookies
    clearAuthCookies(c)

    return c.json({ message: 'Invalid or expired refresh token' }, HttpStatusCodes.UNAUTHORIZED)
  }

  // Generate new tokens
  const { accessToken, refreshToken } = await generateTokens(user.id)

  // Set HTTP-only cookies for tokens
  setAuthCookies(c, { accessToken, refreshToken })

  return c.json({ message: 'Token refreshed successfully' }, HttpStatusCodes.OK)
}

// // Change password handler
// export const changePassword: AppRouteHandler<ChangePasswordRoute> = async c => {
//   const { currentPassword, newPassword, confirmPassword } = c.req.valid('json')

//   // You'll need to implement middleware to get the current user
//   // For now, assuming userId is available in context
//   const userId = c.get('userId') // This would come from auth middleware

//   if (!userId) {
//     return c.json(
//       {
//         success: false,
//         error: 'Unauthorized',
//       },
//       HttpStatusCodes.UNAUTHORIZED,
//     )
//   }

//   // Get user
//   const user = await db
//     .select()
//     .from(users)
//     .where(eq(users.id, userId))
//     .limit(1)
//     .then(rows => rows[0])

//   if (!user) {
//     return c.json(
//       {
//         success: false,
//         error: 'User not found',
//       },
//       HttpStatusCodes.NOT_FOUND,
//     )
//   }

//   // Verify current password
//   const isCurrentPasswordValid = await bcrypt.compare(
//     currentPassword,
//     user.password,
//   )
//   if (!isCurrentPasswordValid) {
//     return c.json(
//       {
//         success: false,
//         error: 'Current password is incorrect',
//       },
//       HttpStatusCodes.BAD_REQUEST,
//     )
//   }

//   // Hash new password
//   const hashedNewPassword = await bcrypt.hash(newPassword, 10)

//   // Update password
//   await db
//     .update(users)
//     .set({
//       password: hashedNewPassword,
//       isPasswordTemp: false,
//     })
//     .where(eq(users.id, userId))

//   // Invalidate all sessions for this user
//   await db
//     .update(sessions)
//     .set({ isActive: false })
//     .where(eq(sessions.userId, userId))

//   return c.json({
//     success: true,
//     message: 'Password changed successfully',
//   })
// }

// // Request password reset handler
// export const requestPasswordReset: AppRouteHandler<
//   RequestPasswordResetRoute
// > = async c => {
//   const { identifier } = c.req.valid('json')

//   try {
//     // Find user by email or phone
//     const user = await db
//       .select()
//       .from(users)
//       .where(or(eq(users.email, identifier), eq(users.phoneNumber, identifier)))
//       .limit(1)
//       .then(rows => rows[0])

//     if (!user) {
//       return c.json(
//         {
//           success: false,
//           error: 'User not found',
//         },
//         HttpStatusCodes.NOT_FOUND,
//       )
//     }

//     // Generate reset token
//     const resetToken = nanoid(32)
//     const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

//     // Save reset token
//     await db.insert(passwordResetTokens).values({
//       userId: user.id,
//       token: resetToken,
//       expiresAt,
//     })

//     // Here you would send email/SMS with reset link
//     // For now, just return success
//     console.log(`Password reset token for ${identifier}: ${resetToken}`)

//     return c.json({
//       success: true,
//       message: 'Password reset instructions sent',
//     })
//   } catch (error) {
//     console.error('Request password reset error:', error)
//     return c.json(
//       {
//         success: false,
//         error: 'Internal server error',
//       },
//       HttpStatusCodes.INTERNAL_SERVER_ERROR,
//     )
//   }
// }

// // Reset password handler
// export const resetPassword: AppRouteHandler<ResetPasswordRoute> = async c => {
//   const { token, newPassword } = c.req.valid('json')

//   try {
//     // Find valid reset token
//     const resetToken = await db
//       .select()
//       .from(passwordResetTokens)
//       .where(eq(passwordResetTokens.token, token))
//       .limit(1)
//       .then(rows => rows[0])

//     if (!resetToken || resetToken.expiresAt < new Date()) {
//       return c.json(
//         {
//           success: false,
//           error: 'Invalid or expired token',
//         },
//         HttpStatusCodes.BAD_REQUEST,
//       )
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10)

//     // Update password
//     await db
//       .update(users)
//       .set({
//         password: hashedPassword,
//         isPasswordTemp: false,
//       })
//       .where(eq(users.id, resetToken.userId))

//     // Delete reset token
//     await db
//       .delete(passwordResetTokens)
//       .where(eq(passwordResetTokens.id, resetToken.id))

//     // Invalidate all sessions for this user
//     await db
//       .update(sessions)
//       .set({ isActive: false })
//       .where(eq(sessions.userId, resetToken.userId))

//     return c.json({
//       success: true,
//       message: 'Password reset successfully',
//     })
//   } catch (error) {
//     console.error('Reset password error:', error)
//     return c.json(
//       {
//         success: false,
//         error: 'Internal server error',
//       },
//       HttpStatusCodes.INTERNAL_SERVER_ERROR,
//     )
//   }
// }
