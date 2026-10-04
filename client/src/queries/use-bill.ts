import { httpClient } from '@/lib/httpClient'
import type {
  CreatePaymentLinkBodyType,
  CreatePaymentLinkResType,
  GetGuestBillsResType,
} from '@app/shared'
import { useMutation, useQuery } from '@tanstack/react-query'

// Query Keys

export const guestBillsQueryKey = ['guest', 'bills'] as const

// Query Hooks

/** Lịch sử hóa đơn đã thanh toán của khách đang đăng nhập */
export function useGuestBillsQuery(enabled = true) {
  return useQuery({
    queryKey: guestBillsQueryKey,
    queryFn: async () => {
      const res = await httpClient.get<GetGuestBillsResType>('/bill/history')
      return res.data.data
    },
    enabled,
  })
}

// Mutation Hooks

/** Tạo mã thanh toán PayOS (VietQR) — khách gọi */
export function useCreatePaymentLinkMutation() {
  return useMutation({
    mutationFn: () => httpClient.post<CreatePaymentLinkResType>('/bill/create-payment-link'),
  })
}

/** Tạo mã thanh toán PayOS (VietQR) — Thu ngân / Quản lý gọi */
export function useManagerCreatePaymentLinkMutation() {
  return useMutation({
    mutationFn: (body: CreatePaymentLinkBodyType) =>
      httpClient.post<CreatePaymentLinkResType>('/bill/manager/create-payment-link', body),
  })
}
