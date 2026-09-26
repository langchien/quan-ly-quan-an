import z from 'zod'
import { DishStatusValues, OrderStatusValues } from '../../constants/type.js'

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

// Params───────────

export const OrderParam = z.object({ orderId: z.coerce.number() })
export type OrderParamType = z.TypeOf<typeof OrderParam>

// Get Orders (Manager) ─────────────────────────────────────────────────────

export const GetOrdersQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
})
export type GetOrdersQueryParamsType = z.TypeOf<typeof GetOrdersQueryParams>

export const GetOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema),
})
export type GetOrdersResType = z.TypeOf<typeof GetOrdersRes>

// Get Order Detail─

const TableSchema = z.object({
  number: z.number(),
  capacity: z.number(),
  status: z.string(),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetOrderDetailRes = z.object({
  message: z.string(),
  data: OrderSchema.extend({ table: TableSchema.nullable() }),
})
export type GetOrderDetailResType = z.TypeOf<typeof GetOrderDetailRes>

// Update Order─────

export const UpdateOrderBody = z.object({
  status: z.enum(OrderStatusValues),
  dishId: z.number(),
  quantity: z.number(),
})
export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>

export const UpdateOrderRes = z.object({
  message: z.string(),
  data: OrderSchema,
})
export type UpdateOrderResType = z.TypeOf<typeof UpdateOrderRes>

// Create Orders (Manager tạo cho guest) ───────────────────────────────────

export const CreateOrdersBody = z
  .object({
    guestId: z.number(),
    orders: z.array(
      z.object({
        dishId: z.number(),
        quantity: z.number(),
        note: z.string().max(200).trim().optional(),
      })
    ),
  })
  .strict()
export type CreateOrdersBodyType = z.TypeOf<typeof CreateOrdersBody>

export const CreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema),
})
export type CreateOrdersResType = z.TypeOf<typeof CreateOrdersRes>

// Pay Guest Orders─

export const PayGuestOrdersBody = z.object({ guestId: z.number() })
export type PayGuestOrdersBodyType = z.TypeOf<typeof PayGuestOrdersBody>

export const PayGuestOrdersRes = GetOrdersRes
export type PayGuestOrdersResType = z.TypeOf<typeof PayGuestOrdersRes>
