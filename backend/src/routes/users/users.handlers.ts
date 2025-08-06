import bcrypt from 'bcrypt'
import { and, eq, type SQL } from 'drizzle-orm'
import db from '@/db'
import { users } from '@/db/schema'
import { USER_ROLES } from '@/db/schema/users'
import * as HttpStatusCodes from '@/lib/http-status-codes'
import type { AppRouteHandler } from '@/lib/types'
import type { CreateRoute, GetOneRoute, ListRoute, RemoveRoute, UpdateRoute } from './users.routes'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  try {
    const data = await db.select().from(users).all()
    return c.json(
      {
        data,
      },
      HttpStatusCodes.OK
    )
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

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  try {
    const { name, email, phoneNumber } = c.req.valid('json')

    const conditions: SQL[] = []

    if (email) {
      conditions.push(eq(users.email, email))
    }

    if (phoneNumber) {
      conditions.push(eq(users.phoneNumber, phoneNumber))
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: and(...conditions),
    })

    if (existingUser) {
      return c.json(
        {
          message: 'Super admin already exists. You cannot create multiple super admin.',
        },
        HttpStatusCodes.CONFLICT
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('12345678', 10)

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: USER_ROLES.SUPER_ADMIN,
      })
      .returning()

    return c.json(user, HttpStatusCodes.OK)
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

// // create super admin user
// export const createSuperAdmin: AppRouteHandler<CreateSuperAdminRoute> = async (c) => {
//   try {
//     const { name, email, phoneNumber } = c.req.valid('json')

//     const conditions: SQL[] = []

//     if (email) {
//       conditions.push(eq(users.email, email))
//     }

//     if (phoneNumber) {
//       conditions.push(eq(users.phoneNumber, phoneNumber))
//     }

//     // Check if user already exists
//     const existingUser = await db.query.users.findFirst({
//       where: and(...conditions),
//     })

//     if (existingUser) {
//       return c.json(
//         {
//           message: 'Super admin already exists. You cannot create multiple super admin.',
//         },
//         HttpStatusCodes.CONFLICT
//       )
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash('demo', 10)

//     // Create user
//     const [user] = await db
//       .insert(users)
//       .values({
//         name,
//         email,
//         phoneNumber,
//         password: hashedPassword,
//         role: USER_ROLES.SUPER_ADMIN,
//       })
//       .returning()

//     return c.json(user, HttpStatusCodes.OK)
//   } catch (error) {
//     // Catch any unexpected errors
//     console.error('Unexpected error:', error)
//     return c.json(
//       {
//         message: 'An unexpected error occurred. Please try again later.',
//       },
//       HttpStatusCodes.INTERNAL_SERVER_ERROR
//     )
//   }
// }

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param')

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!user) {
      return c.json(
        {
          message: 'User not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(user, HttpStatusCodes.OK)
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

export const update: AppRouteHandler<UpdateRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param')
    const user = c.req.valid('json')

    const userList = await db.update(users).set(user).where(eq(users.id, id)).returning()

    if (userList.length === 0) {
      return c.json(
        {
          message: 'User not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.json(userList[0], HttpStatusCodes.OK)
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

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param')

    console.info(id)

    const result = await db.delete(users).where(eq(users.id, id))

    if (result.rowsAffected === 0) {
      return c.json(
        {
          message: 'User not found or already deleted.',
        },
        HttpStatusCodes.NOT_FOUND
      )
    }

    return c.body(null, HttpStatusCodes.NO_CONTENT)
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
