import { httpClient } from '@/lib/httpClient'
import type { CreatePaymentLinkBodyType, CreatePaymentLinkResType } from '@app/shared'
import { useMutation } from '@tanstack/react-query'

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
