import { formatCurrencyVND } from '@/components/home/dish-card'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatus } from '@/constants/type'
import type { GuestGetOrdersResType } from '@/schemaValidations/guest.schema'
import { OrderStatusBadge } from './order-status-badge'

type Order = GuestGetOrdersResType['data'][number]

export function OrdersListSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className='flex items-center gap-4 p-4'>
            <Skeleton className='h-16 w-16 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
            <Skeleton className='h-6 w-20 rounded-full' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const sectionOrder = [
  OrderStatus.Pending,
  OrderStatus.Processing,
  OrderStatus.Delivered,
  OrderStatus.Rejected,
  OrderStatus.Paid,
]

function OrderItem({ order }: { order: Order }) {
  const snapshot = order.dishSnapshot
  return (
    <Card className='overflow-hidden'>
      <CardContent className='flex items-center gap-4 p-4'>
        {/* Ảnh */}
        <div className='h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted'>
          {snapshot.image ? (
            <img src={snapshot.image} alt={snapshot.name} className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-2xl'>🍽️</div>
          )}
        </div>

        {/* Thông tin */}
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium'>{snapshot.name}</p>
          <p className='text-sm text-muted-foreground'>
            {formatCurrencyVND(snapshot.price)} × {order.quantity}
          </p>
          <p className='text-sm font-semibold text-primary'>
            {formatCurrencyVND(snapshot.price * order.quantity)}
          </p>
        </div>

        {/* Trạng thái */}
        <OrderStatusBadge status={order.status} />
      </CardContent>
    </Card>
  )
}

interface OrdersListProps {
  orders: Order[]
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <p className='text-lg font-medium text-muted-foreground'>Chưa có đơn hàng nào</p>
        <p className='mt-1 text-sm text-muted-foreground/70'>
          Hãy vào trang <strong>Gọi món</strong> để đặt món nhé!
        </p>
      </div>
    )
  }

  // Nhóm đơn theo trạng thái
  const grouped = sectionOrder.reduce<Record<string, Order[]>>((acc, status) => {
    const group = orders.filter(o => o.status === status)
    if (group.length > 0) acc[status] = group
    return acc
  }, {})

  const totalAmount = orders.reduce((sum, o) => sum + o.dishSnapshot.price * o.quantity, 0)

  return (
    <div className='space-y-6'>
      {Object.entries(grouped).map(([status, group]) => (
        <section key={status} id={`orders-section-${status.toLowerCase()}`}>
          <div className='mb-3 flex items-center gap-2'>
            <OrderStatusBadge status={status} />
            <span className='text-sm text-muted-foreground'>({group.length} món)</span>
          </div>
          <div className='space-y-3'>
            {group.map(order => (
              <OrderItem key={order.id} order={order} />
            ))}
          </div>
        </section>
      ))}

      {/* Tổng tiền */}
      <Separator />
      <div className='flex items-center justify-between px-1 text-base font-semibold'>
        <span>Tổng cộng ({orders.length} món)</span>
        <span className='text-primary'>{formatCurrencyVND(totalAmount)}</span>
      </div>
    </div>
  )
}
