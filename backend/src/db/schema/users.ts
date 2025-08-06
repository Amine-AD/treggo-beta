import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'

import { orders } from './orders'

// User roles enum for type safety
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_AGENT: 'sales_agent',
  DELIVERY_STAFF: 'delivery_staff',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Extract enum values for Drizzle schema
const userRoleValues = Object.values(USER_ROLES) as [string, ...string[]]

// Users table - simplified
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    email: text('email').unique(),
    phoneNumber: text('phone_number').unique(),
    role: text('role', { enum: userRoleValues }).notNull(),

    // Authentication
    password: text('password').notNull(),
    isPasswordTemp: integer('is_password_temp', { mode: 'boolean' }).default(true).notNull(),

    // Status
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),

    // Tracking
    createdBy: integer('created_by'),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_phone_idx').on(table.phoneNumber),
  ]
)

// Password reset tokens - simplified
export const passwordResetTokens = sqliteTable(
  'password_reset_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index('password_reset_tokens_token_idx').on(table.token)]
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  passwordResetTokens: many(passwordResetTokens),
  orders: many(orders),
}))

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}))

// Zod schemas for validation
export const selectUserSchema = createSelectSchema(users).omit({
  password: true,
})

const emailRegex = /^\S+@\S+\.\S+$/
const moroccanPhoneRegex = /^06\d{8}$/

// Login schema
export const loginSchema = z.object({
  identifier: z.string().check((ctx) => {
    if (ctx.value.length === 0) {
      ctx.issues.push({
        code: 'custom',
        path: ['identifier'],
        message: 'Identifier is required',
        input: ctx.value,
      })
      return
    }

    if (!(emailRegex.test(ctx.value) || moroccanPhoneRegex.test(ctx.value))) {
      ctx.issues.push({
        code: 'custom',
        path: ['identifier'],
        message: 'Identifier must be a valid email address or phone number',
        input: ctx.value,
      })
      return
    }
  }),
  password: z.string().check((ctx) => {
    if (ctx.value.length === 0) {
      ctx.issues.push({
        code: 'custom',
        path: ['password'],
        message: 'Password is required',
        input: ctx.value,
      })
    }

    if (ctx.value.length < 8) {
      ctx.issues.push({
        code: 'custom',
        path: ['password'],
        message: 'Password must be at least 8 characters long',
        input: ctx.value,
      })
    }

    if (ctx.value.length > 64) {
      ctx.issues.push({
        code: 'custom',
        path: ['password'],
        message: 'Password must be at most 64 characters long',
        input: ctx.value,
      })
    }
  }),
})

// User creation schema
export const createUserSchema = createInsertSchema(users, {
  name: (schema) => schema.min(1, 'Name is required').max(255, 'Name is too long'),
  email: (schema) => schema.regex(emailRegex, 'Invalid email address').optional(),
  phoneNumber: (schema) =>
    schema.regex(moroccanPhoneRegex, 'Phone number must be a valid Moroccan number').optional(),
  role: (schema) =>
    schema.refine(
      (val) => Object.values(USER_ROLES).includes(val as UserRole),
      "Invalid user role'"
    ),
})
  .omit({
    id: true,
    password: true,
    isPasswordTemp: true,
    lastLoginAt: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  })
  .check((ctx) => {
    const { email, phoneNumber, role, createdBy } = ctx.value
    if (!(email || phoneNumber)) {
      ctx.issues.push({
        code: 'custom',
        path: ['identifier'],
        message: 'At least one of email and phone number must be provided',
        input: ctx.value,
      })
    }

    if (role !== 'super_admin' && (createdBy === undefined || createdBy === null)) {
      ctx.issues.push({
        code: 'custom',
        path: ['createdBy'],
        message: 'createdBy is required for non-super admin users',
        input: ctx.value,
      })
    }
  })

// User creation schema
export const updateUserSchema = createUpdateSchema(users)

// // Password change schema - using createInsertSchema
// export const rawPasswordSchema = createInsertSchema(users)
//   .pick({ password: true })
//   .extend({
//     currentPassword: z.string().min(1, 'Current password is required'),
//     newPassword: z
//       .string()
//       .min(8, 'Password must be at least 8 characters')
//       .regex(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
//         'Password must contain at least one uppercase letter, one lowercase letter, and one number'
//       ),
//     confirmPassword: z.string(),
//   })
//   .omit({ password: true })

// // Apply superRefine on a separate schema
// export const changePasswordSchema = rawPasswordSchema.superRefine((data, ctx) => {
//   if (data.newPassword !== data.confirmPassword) {
//     ctx.addIssue({
//       path: ['confirmPassword'],
//       code: 'custom',
//       message: "Passwords don't match",
//     })
//   }
// })

// // Password reset schema - using createInsertSchema
// export const resetPasswordSchema = createInsertSchema(users)
//   .pick({ password: true })
//   .extend({
//     token: z.string().min(1, 'Reset token is required'),
//     newPassword: z
//       .string()
//       .min(8, 'Password must be at least 8 characters')
//       .regex(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
//         'Password must contain at least one uppercase letter, one lowercase letter, and one number'
//       ),
//   })
//   .omit({ password: true })
