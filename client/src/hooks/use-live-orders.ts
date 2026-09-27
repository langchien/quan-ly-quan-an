import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocketEvents } from '@/hooks/use-socket-event'
import { adminOrdersQueryKey, useGetOrdersQuery } from '@/queries/use-order'
import { useGetTableList } from '@/queries/use-table'
import { useAudioChime } from '@/hooks/use-audio-chime'
import { OrderStatus } from '@/constants/type'
import { toast } from 'sonner'

/**
 * Hook tập trung logic data cho Live Dashboard.
 * - Fetch orders hôm nay + danh sách bàn
 * - Lắng nghe socket realtime
 * - Phát chuông báo khi có đơn mới
 * - Tính toán KPI live
 */
export function useLiveOrders() {
  const queryClient = useQueryClient()
  const audioChime = useAudioChime()

  // Query: lấy orders hôm nay (từ 00:00 → 23:59)
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

  const { data: orders, isLoading: isLoadingOrders } = useGetOrdersQuery({
    fromDate: todayStart,
    toDate: todayEnd,
  })

  const { data: tables, isLoading: isLoadingTables } = useGetTableList()

  // Socket events — dùng useSocketEvents hook chuẩn hóa
  useSocketEvents({
    'new-order': () => {
      toast.info('🔔 Có đơn hàng mới!', {
        description: 'Danh sách đơn hàng vừa được cập nhật.',
      })
      audioChime.playChime()
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
    'update-order': () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
    'payment': () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] })
    },
    'table-token-rotated': (payload) => {
      const { tableNumber } = payload as { tableNumber: number }
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['tables', 'detail', tableNumber] })
      toast.info(`🔑 QR bàn ${tableNumber} đã được làm mới`, {
        description: 'Token bàn đã thay đổi, mã QR cũ không còn hiệu lực.',
      })
    },
  })

  // Computed KPIs
  const liveOrders = orders ?? []

  const pendingOrders = useMemo(
    () => liveOrders.filter(o => o.status === OrderStatus.Pending),
    [liveOrders]
  )

  const processingOrders = useMemo(
    () => liveOrders.filter(o => o.status === OrderStatus.Processing),
    [liveOrders]
  )

  const deliveredOrders = useMemo(
    () => liveOrders.filter(o => o.status === OrderStatus.Delivered),
    [liveOrders]
  )

  const activeOrders = useMemo(
    () =>
      liveOrders.filter(o => o.status !== OrderStatus.Paid && o.status !== OrderStatus.Rejected),
    [liveOrders]
  )

  const todayRevenue = useMemo(
    () =>
      liveOrders
        .filter(o => o.status === OrderStatus.Paid)
        .reduce((sum, o) => sum + o.dishSnapshot.price * o.quantity, 0),
    [liveOrders]
  )

  const servingTableCount = useMemo(
    () => (tables ?? []).filter(t => t.status === 'Reserved').length,
    [tables]
  )

  const totalTableCount = (tables ?? []).length

  return {
    // Raw data
    liveOrders,
    tables: tables ?? [],
    // Filtered
    pendingOrders,
    processingOrders,
    deliveredOrders,
    activeOrders,
    // KPIs
    pendingCount: pendingOrders.length,
    processingCount: processingOrders.length,
    todayRevenue,
    servingTableCount,
    totalTableCount,
    // State
    isLoading: isLoadingOrders || isLoadingTables,
    // Audio
    audioChime,
  }
}
