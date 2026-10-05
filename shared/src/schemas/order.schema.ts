import z from "zod";
import { DishStatusValues, OrderStatusValues } from "../constants.js";
import { AccountSchema } from "./account.schema.js";
import { TableSchema } from "./table.schema.js";

export const DishSnapshotSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  status: z.enum(DishStatusValues),
  dishId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DishSnapshotType = z.output<typeof DishSnapshotSchema>;

export const OrderSchema = z.object({
  id: z.number(),
  guestId: z.number().nullable(),
  guest: z
    .object({
      id: z.number(),
      name: z.string(),
      tableNumber: z.number().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
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
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type OrderSchemaType = z.output<typeof OrderSchema>;

export const OrderParam = z.object({
  orderId: z.coerce.number(),
});

export type OrderParamType = z.output<typeof OrderParam>;

export const GetOrdersQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type GetOrdersQueryParamsType = z.output<typeof GetOrdersQueryParams>;
export type GetOrdersQueryParamsInputType = Partial<GetOrdersQueryParamsType>;

export const PaginationMeta = z.object({
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
});

export type PaginationMetaType = z.output<typeof PaginationMeta>;

export const GetOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema),
  pagination: PaginationMeta,
});

export type GetOrdersResType = z.output<typeof GetOrdersRes>;

export const GetOrderDetailRes = z.object({
  message: z.string(),
  data: OrderSchema.extend({
    table: TableSchema.nullable(),
  }),
});

export type GetOrderDetailResType = z.output<typeof GetOrderDetailRes>;

export const UpdateOrderBody = z.object({
  status: z.enum(OrderStatusValues),
  dishId: z.number(),
  quantity: z.number(),
});

export type UpdateOrderBodyType = z.output<typeof UpdateOrderBody>;

export const UpdateOrderRes = z.object({
  message: z.string(),
  data: OrderSchema,
});

export type UpdateOrderResType = z.output<typeof UpdateOrderRes>;

export const CreateOrdersBody = z
  .object({
    guestId: z.number(),
    orders: z.array(
      z.object({
        dishId: z.number(),
        quantity: z.number(),
        note: z.string().max(200).trim().optional(),
      }),
    ),
  })
  .strict();

export type CreateOrdersBodyType = z.output<typeof CreateOrdersBody>;

export const CreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema),
});

export type CreateOrdersResType = z.output<typeof CreateOrdersRes>;

export const PayGuestOrdersBody = z.object({
  guestId: z.number(),
});

export type PayGuestOrdersBodyType = z.output<typeof PayGuestOrdersBody>;

export const PayGuestOrdersRes = GetOrdersRes;

export type PayGuestOrdersResType = z.output<typeof PayGuestOrdersRes>;
