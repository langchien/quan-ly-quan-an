import z from 'zod'
import { DishStatusValues, OrderStatusValues, RoleValues } from '../../constants/type.js'

// Shared Sub-schemas

const DishSnapshotSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  status: z.enum(DishStatusValues),
  dishId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  avatar: z.string().nullable(),
})

export const OrderSchema = z.object({
  id: z.number(),
  guestId: z.number().nullable(),
  guest: z
    .object({
      id: z.number(),
      name: z.string(),
      tableNumber: z.number().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
    .nullable(),
  tableNumber: z.number().nullable(),
  dishSnapshotId: z.number(),
  dishSnapshot: DishSnapshotSchema,
  quantity: z.number(),
  note: z.string().nullable(),
  orderHandlerId: z.number().nullable(),
  orderHandler: AccountSchema.nullable(),
  status: z.enum(OrderStatusValues),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Guest Login

export const GuestLoginBody = z
  .object({
    name: z.string().min(2).max(50),
    tableNumber: z.number(),
    token: z.string(),
  })
  .strict()

export type GuestLoginBodyType = z.TypeOf<typeof GuestLoginBody>

export const GuestLoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    guest: z.object({
      id: z.number(),
      name: z.string(),
      role: z.enum(RoleValues),
      tableNumber: z.number().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  }),
  message: z.string(),
})

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>

// Guest Logout

export const GuestLogoutBody = z.object({ refreshToken: z.string() }).strict()
export type GuestLogoutBodyType = z.TypeOf<typeof GuestLogoutBody>

// Guest Refresh Token

export const GuestRefreshTokenBody = z.object({ refreshToken: z.string() }).strict()
export type GuestRefreshTokenBodyType = z.TypeOf<typeof GuestRefreshTokenBody>

export const GuestRefreshTokenRes = z.object({
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
})
export type GuestRefreshTokenResType = z.TypeOf<typeof GuestRefreshTokenRes>

// Guest Create Orders

export const GuestCreateOrdersBody = z.array(
  z.object({
    dishId: z.number(),
    quantity: z.number(),
    note: z.string().max(200).trim().optional(),
  })
)

export type GuestCreateOrdersBodyType = z.TypeOf<typeof GuestCreateOrdersBody>

export const GuestCreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema),
})

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>

// Guest Get Orders

export const GuestGetOrdersRes = GuestCreateOrdersRes
export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>
