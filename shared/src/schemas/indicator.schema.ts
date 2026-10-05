import z from "zod";

export const DashboardIndicatorQueryParams = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
});
export type DashboardIndicatorQueryParamsType = z.output<
  typeof DashboardIndicatorQueryParams
>;

export const DishIndicatorSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  successOrders: z.number(),
});
export type DishIndicatorType = z.output<typeof DishIndicatorSchema>;

export const RevenueByDateSchema = z.object({
  date: z.string(),
  revenue: z.number(),
});
export type RevenueByDateType = z.output<typeof RevenueByDateSchema>;

export const DashboardIndicatorRes = z.object({
  data: z.object({
    revenue: z.number(),
    guestCount: z.number(),
    orderCount: z.number(),
    servingTableCount: z.number(),
    dishIndicator: z.array(DishIndicatorSchema),
    revenueByDate: z.array(RevenueByDateSchema),
  }),
});
export type DashboardIndicatorResType = z.output<typeof DashboardIndicatorRes>;
