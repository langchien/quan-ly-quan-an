import { httpClient } from '@/lib/httpClient'
import type {
  LogoutBodyType,
  MessageResType,
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersResType,
  GuestLoginBodyType,
  GuestLoginResType,
} from '@app/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query Keys

export const guestOrdersQueryKey = ['guest', 'orders'] as const

// Mutation Hooks

/** Đăng nhập khách (lấy token từ QR bàn) */
export function useGuestLoginMutation() {
  return useMutation({
    mutationFn: (body: GuestLoginBodyType) =>
      httpClient.post<GuestLoginResType>('/guest/auth/login', body),
  })
}

/** Đăng xuất khách */
export function useGuestLogoutMutation() {
  return useMutation({
    mutationFn: (body: LogoutBodyType) =>
      httpClient.post<MessageResType>('/guest/auth/logout', body),
  })
}

/** Đặt món — gửi mảng { dishId, quantity } */
export function useGuestCreateOrdersMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: GuestCreateOrdersBodyType) =>
      httpClient.post<GuestCreateOrdersResType>('/guest/orders', body),
    onSuccess: () => {
      // Invalidate danh sách đơn sau khi đặt thành công
      queryClient.invalidateQueries({ queryKey: guestOrdersQueryKey })
    },
  })
}

// Query Hooks

/** Lấy danh sách đơn hàng của khách đang đăng nhập */
export function useGuestGetOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: guestOrdersQueryKey,
    queryFn: async () => {
      const res = await httpClient.get<GuestGetOrdersResType>('/guest/orders')
      return res.data.data
    },
    enabled,
  })
}
