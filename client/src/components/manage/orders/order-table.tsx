import { CreateOrderDialog } from '@/components/manage/orders/create-order-dialog'
import { getOrderColumns } from '@/components/manage/orders/order-columns'
import { OrderDataTable } from '@/components/manage/orders/order-data-table'
import { PayGuestDialog } from '@/components/manage/orders/pay-guest-dialog'
import { UpdateOrderDialog } from '@/components/manage/orders/update-order-dialog'
import { OrderStatus } from '@app/shared'
import { useSocketEvents } from '@/hooks/use-socket-event'
import { adminOrdersQueryKey, useGetOrdersQuery } from '@/queries/use-order'
import type { OrderSchemaType } from '@app/shared'
import { useQueryClient } from '@tanstack/react-query'
import { ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useStatusLabel } from '@/lib/status-label'

export function OrderTable() {
  const { t } = useTranslation(['manage', 'common'])
  const { getOrderStatusLabel } = useStatusLabel()
  const queryClient = useQueryClient()
  const { data: queryResult, isLoading, isError } = useGetOrdersQuery()
  const orders = queryResult?.data

  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<OrderSchemaType | null>(null)
  const [payTarget, setPayTarget] = useState<OrderSchemaType | null>(null)

  // Lắng nghe socket events realtime
  useSocketEvents({
    'new-order': () => {
      toast.info(t('orders.socket.newOrder', { defaultValue: 'Có đơn hàng mới!' }), {
        description: t('orders.socket.newOrderDesc', {
          defaultValue: 'Danh sách đơn hàng vừa được cập nhật.',
        }),
      })
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
    'update-order': () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
    payment: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey })
    },
  })

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
        t,
        getStatusLabel: getOrderStatusLabel,
      }),
    [t, getOrderStatusLabel]
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <ShoppingBag className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>{t('orders.loadError')}</p>
          <p className='text-sm text-muted-foreground'>{t('orders.tryAgainLater')}</p>
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
