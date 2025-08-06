import { createRoute, z } from '@hono/zod-openapi'
import { loginSchema, selectUserSchema } from '@/db/schema/users'
import createErrorSchema from '@/lib/create-error-schema'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import jsonContent from '@/lib/json-content'
import jsonContentRequired from '@/lib/json-content-required'
import { authMiddleware, refreshTokenMiddleware } from '@/middlewares/auth-middleware'

// Get current user route
export const getCurrentUser = createRoute({
  tags: ['Auth'],
  method: 'get',
  path: '/auth/me',
  summary: 'Get current user',
  description: 'Retrieves the authenticated user information',
  middleware: [...authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        data: selectUserSchema,
      }),
      'Successfully retrieved current user information'
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      z.object({ message: z.string() }),
      'User account is disabled or lacks required permissions'
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ message: z.string() }),
      'User account no longer exists or has been deleted'
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error occurred while fetching user data'
    ),
  },
})

// Login route
export const login = createRoute({
  tags: ['Auth'],
  method: 'post',
  path: '/auth/login',
  summary: 'User login',
  description: 'Logs in a user to the application',
  request: {
    body: jsonContentRequired(
      loginSchema,
      'User login credentials including email/username and password'
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Login successful'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(loginSchema),
      'Request validation failed - check field formats and requirements'
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      z.object({ message: z.string() }),
      'User account has been deactivated'
    ),
    // [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
    //   z.object({ message: z.string() }),
    //   'Too many login attempts from this IP - please try again later',
    // ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error occurred during authentication process'
    ),
  },
})

// Logout route
export const logout = createRoute({
  tags: ['Auth'],
  method: 'post',
  path: '/auth/logout',
  summary: 'User logout',
  description: 'Logs out a user from the application',
  responses: {
    [HttpStatusCodes.OK]: {
      description: 'Logout successful',
    },
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error occurred during logout process'
    ),
  },
})

// Refresh token route
export const refreshTokenFn = createRoute({
  tags: ['Auth'],
  method: 'post',
  path: '/auth/refresh-token',
  summary: 'Refresh token',
  description: 'Generates a new access token using a valid refresh token',
  middleware: [refreshTokenMiddleware],
  responses: {
    [HttpStatusCodes.OK]: {
      description: 'Token refresh successful',
    },
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      createErrorSchema(z.object({ message: z.string() })),
      'User session has been terminated or account is no longer active'
    ),
    // [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
    //   z.object({ message: z.string() }),
    //   'Too many token refresh requests - please wait before trying again',
    // ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      'Unauthorized error'
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ message: z.string() }),
      'Internal server error occurred during token refresh process'
    ),
  },
})

// // Change password route
// export const changePassword = createRoute({
//   tags: ['Auth'],
//   method: 'post',
//   path: '/auth/change-password',
//   security: [{ Bearer: [] }],
//   request: {
//     body: jsonContentRequired(rawPasswordSchema, 'Password change data'),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: {
//       description: 'Password changed successfully',
//     },
//     [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
//       z.object({ message: z.string() }),
//       'Unauthorized',
//     ),
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(rawPasswordSchema),
//       'Validation error',
//     ),
//   },
// })

// // Request password reset route
// export const requestPasswordReset = createRoute({
//   tags: ['Auth'],
//   method: 'post',
//   path: '/auth/forgot-password',
//   request: {
//     body: jsonContentRequired(
//       requestPasswordResetSchema,
//       'Password reset request',
//     ),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       messageResponseSchema,
//       'Password reset email sent',
//     ),
//     [HttpStatusCodes.NOT_FOUND]: jsonContent(
//       createErrorSchema(z.string()),
//       'User not found',
//     ),
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(requestPasswordResetSchema),
//       'Validation error',
//     ),
//   },
// })

// // Reset password route
// export const resetPassword = createRoute({
//   tags: ['Auth'],
//   method: 'post',
//   path: '/auth/reset-password',
//   request: {
//     body: jsonContentRequired(resetPasswordSchema, 'Password reset data'),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       messageResponseSchema,
//       'Password reset successfully',
//     ),
//     [HttpStatusCodes.BAD_REQUEST]: jsonContent(
//       createErrorSchema(z.string()),
//       'Invalid or expired token',
//     ),
//     [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(resetPasswordSchema),
//       'Validation error',
//     ),
//   },
// })

// Type exports for handlers
export type GetCurrentUserRoute = typeof getCurrentUser
export type LoginRoute = typeof login
export type LogoutRoute = typeof logout
export type RefreshTokenRoute = typeof refreshTokenFn
// export type ChangePasswordRoute = typeof changePassword
// export type RequestPasswordResetRoute = typeof requestPasswordReset
// export type ResetPasswordRoute = typeof resetPassword
