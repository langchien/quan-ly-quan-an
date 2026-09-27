import { httpClient } from '@/lib/httpClient'
import type {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from '@/schemaValidations/order.schema'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query Keys

export const adminOrdersQueryKey = ['admin', 'orders'] as const

// Query Options Factory

export function ordersQueryOptions(params?: GetOrdersQueryParamsType) {
  return queryOptions({
    queryKey: [...adminOrdersQueryKey, params] as const,
    queryFn: async () => {
      const searchParams: Record<string, string> = {}
      if (params?.fromDate) searchParams.fromDate = params.fromDate.toISOString()
      if (params?.toDate) searchParams.toDate = params.toDate.toISOString()
      if (params?.page) searchParams.page = String(params.page)
      if (params?.limit) searchParams.limit = String(params.limit)

      const res = await httpClient.get<GetOrdersResType>('/orders', { params: searchParams })
      return { data: res.data.data, pagination: res.data.pagination }
    },
  })
}

// Query Hooks

/** Lấy danh sách đơn hàng (admin) */
export function useGetOrdersQuery(params?: GetOrdersQueryParamsType) {
  return useQuery(ordersQueryOptions(params))
}

/** Lấy chi tiết một đơn hàng */
export function useGetOrderDetailQuery(orderId: number) {
  return useQuery({
    queryKey: [...adminOrdersQueryKey, 'detail', orderId] as const,
    queryFn: async () => {
      const res = await httpClient.get<GetOrderDetailResType>(`/orders/${orderId}`)
      return res.data.data
    },
    enabled: !!orderId,
  })
}

// Mutation Hooks

/** Cập nhật trạng thái / số lượng đơn hàng */
export function useUpdateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: number; body: UpdateOrderBodyType }) =>
      httpClient.put<UpdateOrderResType>(`/orders/${orderId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
  })
}

/** Tạo đơn hàng mới cho khách (admin) */
export function useCreateOrdersMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrdersBodyType) =>
      httpClient.post<CreateOrdersResType>('/orders', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
  })
}

/** Thanh toán tất cả đơn của một khách */
export function usePayGuestOrdersMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) =>
      httpClient.post<PayGuestOrdersResType>('/orders/pay', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
  })
}
