import { CreateOrderDialog } from '@/components/manage/orders/create-order-dialog'
import { getOrderColumns } from '@/components/manage/orders/order-columns'
import { OrderDataTable } from '@/components/manage/orders/order-data-table'
import { PayGuestDialog } from '@/components/manage/orders/pay-guest-dialog'
import { UpdateOrderDialog } from '@/components/manage/orders/update-order-dialog'
import { OrderStatus } from '@/constants/type'
import { socket } from '@/lib/socket'
import { adminOrdersQueryKey, useGetOrdersQuery } from '@/queries/use-order'
import type { OrderSchemaType } from '@/schemaValidations/order.schema'
import { useQueryClient } from '@tanstack/react-query'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export function OrderTable() {
  const queryClient = useQueryClient()
  const { data: orders, isLoading, isError } = useGetOrdersQuery()

  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<OrderSchemaType | null>(null)
  const [payTarget, setPayTarget] = useState<OrderSchemaType | null>(null)

  // ── Lắng nghe socket events realtime ──────────────────────────────────────────
  useEffect(() => {
    function handleNewOrder() {
      toast.info('Có đơn hàng mới!', {
        description: 'Danh sách đơn hàng vừa được cập nhật.',
      })
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    }

    function handleUpdateOrder() {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    }

    function handlePayment() {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    }

    socket.on('new-order', handleNewOrder)
    socket.on('update-order', handleUpdateOrder)
    socket.on('payment', handlePayment)

    return () => {
      socket.off('new-order', handleNewOrder)
      socket.off('update-order', handleUpdateOrder)
      socket.off('payment', handlePayment)
    }
  }, [queryClient])

  // Lọc các đơn chưa thanh toán của guest được chọn thanh toán
  const pendingOrdersForPay = useMemo(() => {
    if (!payTarget?.guestId || !orders) return []
    return orders.filter(
      o =>
        o.guestId === payTarget.guestId &&
        o.status !== OrderStatus.Paid &&
        o.status !== OrderStatus.Rejected
    )
  }, [payTarget, orders])

  const columns = useMemo(
    () =>
      getOrderColumns({
        onUpdate: order => setUpdateTarget(order),
        onPay: order => setPayTarget(order),
      }),
    []
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <ShoppingBag className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>Không thể tải danh sách đơn hàng</p>
          <p className='text-sm text-muted-foreground'>Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <OrderDataTable
        columns={columns}
        data={orders ?? []}
        isLoading={isLoading}
        onAddOrder={() => setCreateOpen(true)}
      />

      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />

      <UpdateOrderDialog
        order={updateTarget}
        open={!!updateTarget}
        onOpenChange={open => !open && setUpdateTarget(null)}
      />

      <PayGuestDialog
        order={payTarget}
        pendingOrders={pendingOrdersForPay}
        open={!!payTarget}
        onOpenChange={open => !open && setPayTarget(null)}
      />
    </>
  )
}
