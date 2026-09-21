import z from 'zod'

// Query params cho dashboard indicator
export const DashboardIndicatorQueryParams = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
})
export type DashboardIndicatorQueryParamsType = z.TypeOf<typeof DashboardIndicatorQueryParams>

// Dish indicator item trong response
export const DishIndicatorSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  successOrders: z.number(),
})
export type DishIndicatorType = z.TypeOf<typeof DishIndicatorSchema>

// Revenue by date item
export const RevenueByDateSchema = z.object({
  date: z.string(),
  revenue: z.number(),
})
export type RevenueByDateType = z.TypeOf<typeof RevenueByDateSchema>

// Full dashboard indicator response
export const DashboardIndicatorRes = z.object({
  data: z.object({
    revenue: z.number(),
    guestCount: z.number(),
    orderCount: z.number(),
    servingTableCount: z.number(),
    dishIndicator: z.array(DishIndicatorSchema),
    revenueByDate: z.array(RevenueByDateSchema),
  }),
})
export type DashboardIndicatorResType = z.TypeOf<typeof DashboardIndicatorRes>
