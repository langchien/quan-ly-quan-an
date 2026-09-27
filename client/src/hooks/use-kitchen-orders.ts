import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocketEvents } from '@/hooks/use-socket-event'
import { adminOrdersQueryKey, useGetOrdersQuery } from '@/queries/use-order'
import { useAudioChime } from '@/hooks/use-audio-chime'
import { OrderStatus } from '@/constants/type'
import { toast } from 'sonner'

/**
 * Hook tập trung logic data cho Kitchen Display System.
 * - Fetch orders hôm nay
 * - Lắng nghe socket realtime (new-order, update-order, payment)
 * - Phát chuông báo khi có đơn mới
 * - Lọc chỉ Pending + Processing (bếp không cần thấy Delivered/Paid/Rejected)
 * - Nhóm đơn theo bàn
 */
export function useKitchenOrders() {
  const queryClient = useQueryClient()
  const audioChime = useAudioChime()

  // Query: lấy orders hôm nay (00:00 → 23:59)
  const todayStart = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const todayEnd = useMemo(() => {
    const d = new Date()
    d.setHours(23, 59, 59, 999)
    return d
  }, [])

  const { data: orders, isLoading } = useGetOrdersQuery({
    fromDate: todayStart,
    toDate: todayEnd,
  })

  // Socket events — chuông báo + invalidate cache
  useSocketEvents({
    'new-order': () => {
      toast.info('🔔 Đơn mới vào bếp!', {
        description: 'Có đơn hàng mới cần chuẩn bị.',
      })
      audioChime.playChime()
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
    'update-order': () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
    'payment': () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
  })

  const allOrders = orders ?? []

  // Chỉ lấy đơn liên quan đến bếp
  const pendingOrders = useMemo(
    () =>
      allOrders
        .filter(o => o.status === OrderStatus.Pending)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), // FIFO: cũ nhất lên đầu
    [allOrders]
  )

  const processingOrders = useMemo(
    () =>
      allOrders
        .filter(o => o.status === OrderStatus.Processing)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [allOrders]
  )

  // Nhóm đơn pending theo bàn
  const pendingByTable = useMemo(() => {
    const map = new Map<number, typeof pendingOrders>()
    for (const order of pendingOrders) {
      const table = order.tableNumber ?? 0
      if (!map.has(table)) map.set(table, [])
      map.get(table)!.push(order)
    }
    return map
  }, [pendingOrders])

  // Nhóm đơn processing theo bàn
  const processingByTable = useMemo(() => {
    const map = new Map<number, typeof processingOrders>()
    for (const order of processingOrders) {
      const table = order.tableNumber ?? 0
      if (!map.has(table)) map.set(table, [])
      map.get(table)!.push(order)
    }
    return map
  }, [processingOrders])

  // Đếm tổng đơn đã hoàn thành hôm nay
  const completedToday = useMemo(
    () => allOrders.filter(o => o.status === OrderStatus.Delivered || o.status === OrderStatus.Paid).length,
    [allOrders]
  )

  return {
    pendingOrders,
    processingOrders,
    pendingByTable,
    processingByTable,
    pendingCount: pendingOrders.length,
    processingCount: processingOrders.length,
    completedToday,
    isLoading,
    audioChime,
  }
}
