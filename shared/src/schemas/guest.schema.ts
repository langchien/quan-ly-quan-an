import z from 'zod'
import { RoleValues } from '../constants.js'
import { OrderSchema } from './order.schema.js'

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
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    }),
  }),
  message: z.string(),
})

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>

export const GuestLogoutBody = z.object({ refreshToken: z.string() }).strict()
export type GuestLogoutBodyType = z.TypeOf<typeof GuestLogoutBody>

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

export const GuestGetOrdersRes = GuestCreateOrdersRes

export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>

export const GetListGuestsRes = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      tableNumber: z.number().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
  ),
  message: z.string(),
})

export type GetListGuestsResType = z.TypeOf<typeof GetListGuestsRes>

export const GetGuestListQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
})

export type GetGuestListQueryParamsType = z.TypeOf<typeof GetGuestListQueryParams>

export const CreateGuestBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    tableNumber: z.number(),
  })
  .strict()

export type CreateGuestBodyType = z.TypeOf<typeof CreateGuestBody>

export const CreateGuestRes = z.object({
  message: z.string(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    role: z.enum(RoleValues),
    tableNumber: z.number().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
})

export type CreateGuestResType = z.TypeOf<typeof CreateGuestRes>
