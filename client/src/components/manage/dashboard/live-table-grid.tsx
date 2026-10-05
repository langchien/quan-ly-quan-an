import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatus } from '@app/shared'
import type { OrderSchemaType } from '@app/shared'
import { OrderCard } from './order-card'
import { PayGuestDialog } from '@/components/manage/orders/pay-guest-dialog'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { CheckCircle2, Clock, CreditCard, Users } from 'lucide-react'

interface LiveTableGridProps {
  orders: OrderSchemaType[]
  isLoading: boolean
}

interface TableGroup {
  tableNumber: number
  guestName: string
  guestId: number | null
  orders: OrderSchemaType[]
  pendingCount: number
  processingCount: number
  deliveredCount: number
  totalCount: number
  maxWaitMinutes: number
  totalAmount: number
}

function getWaitMinutes(createdAt: Date | string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

export function LiveTableGrid({ orders, isLoading }: LiveTableGridProps) {
  const [payTarget, setPayTarget] = useState<OrderSchemaType | null>(null)

  // Gom orders theo bàn (chỉ lấy orders chưa Paid/Rejected)
  const tableGroups = useMemo(() => {
    const activeOrders = orders.filter(
      o => o.status !== OrderStatus.Paid && o.status !== OrderStatus.Rejected
    )

    const map = new Map<number, TableGroup>()

    for (const order of activeOrders) {
      const tableNum = order.tableNumber ?? order.guest?.tableNumber
      if (tableNum == null) continue

      if (!map.has(tableNum)) {
        map.set(tableNum, {
          tableNumber: tableNum,
          guestName: order.guest?.name ?? 'Khách',
          guestId: order.guestId,
          orders: [],
          pendingCount: 0,
          processingCount: 0,
          deliveredCount: 0,
          totalCount: 0,
          maxWaitMinutes: 0,
          totalAmount: 0,
        })
      }

      const group = map.get(tableNum)!
      group.orders.push(order)
      group.totalCount++
      group.totalAmount += order.dishSnapshot.price * order.quantity

      if (order.status === OrderStatus.Pending) group.pendingCount++
      else if (order.status === OrderStatus.Processing) group.processingCount++
      else if (order.status === OrderStatus.Delivered) group.deliveredCount++

      const waitMinutes = getWaitMinutes(order.createdAt)
      if (waitMinutes > group.maxWaitMinutes) group.maxWaitMinutes = waitMinutes
    }

    // Sắp xếp: bàn có món chờ lâu nhất lên trước
    return Array.from(map.values()).sort((a, b) => b.maxWaitMinutes - a.maxWaitMinutes)
  }, [orders])

  // Tính pendingOrders cho PayGuestDialog
  const pendingOrdersForPay = useMemo(() => {
    if (!payTarget?.guestId) return []
    return orders.filter(
      o =>
        o.guestId === payTarget.guestId &&
        o.status !== OrderStatus.Paid &&
        o.status !== OrderStatus.Rejected
    )
  }, [payTarget, orders])

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-5 w-20' />
            </CardHeader>
            <CardContent className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tableGroups.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <Users className='size-12 text-muted-foreground/40' />
        <div>
          <p className='font-medium'>Chưa có bàn nào đang phục vụ</p>
          <p className='text-sm text-muted-foreground'>
            Khi khách quét QR gọi món, bàn sẽ hiển thị tại đây
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {tableGroups.map(group => (
          <TableCard key={group.tableNumber} group={group} onPay={order => setPayTarget(order)} />
        ))}
      </div>

      <PayGuestDialog
        order={payTarget}
        pendingOrders={pendingOrdersForPay}
        open={!!payTarget}
        onOpenChange={open => !open && setPayTarget(null)}
      />
    </>
  )
}

// Table Card

function TableCard({
  group,
  onPay,
}: {
  group: TableGroup
  onPay: (order: OrderSchemaType) => void
}) {
  const allDelivered = group.pendingCount === 0 && group.processingCount === 0
  const progressPercent =
    group.totalCount > 0 ? Math.round((group.deliveredCount / group.totalCount) * 100) : 0

  const borderClass =
    group.maxWaitMinutes >= 15
      ? 'border-red-500/60'
      : group.maxWaitMinutes >= 5
        ? 'border-amber-500/60'
        : allDelivered
          ? 'border-emerald-500/40'
          : ''

  return (
    <Card className={cn('animate-slide-in-card transition-all', borderClass)}>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary'>
              {group.tableNumber}
            </span>
            <div>
              <p className='text-sm font-semibold'>Bàn {group.tableNumber}</p>
              <p className='max-w-[120px] truncate text-xs font-normal text-muted-foreground'>
                {group.guestName}
              </p>
            </div>
          </CardTitle>

          {/* Status badge */}
          {allDelivered ? (
            <Badge className='gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
              <CheckCircle2 className='size-3' />
              Đủ món
            </Badge>
          ) : (
            <Badge variant='outline' className='gap-1 border-amber-400 text-amber-600'>
              <Clock className='size-3' />
              {group.maxWaitMinutes}m
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        <div className='mt-2 space-y-1'>
          <div className='flex justify-between text-[11px] text-muted-foreground'>
            <span>Tiến độ</span>
            <span>
              {group.deliveredCount}/{group.totalCount} món đã giao
            </span>
          </div>
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                allDelivered ? 'bg-emerald-500' : 'bg-primary'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Order list */}
        <div className='-mx-1 max-h-[200px] divide-y overflow-auto px-1'>
          {group.orders
            .sort((a, b) => {
              // Pending lên trước, rồi Processing, rồi Delivered
              const priority: Record<string, number> = {
                [OrderStatus.Pending]: 0,
                [OrderStatus.Processing]: 1,
                [OrderStatus.Delivered]: 2,
              }
              return (priority[a.status] ?? 3) - (priority[b.status] ?? 3)
            })
            .map(order => (
              <OrderCard
                key={order.id}
                order={order}
                variant='table-item'
                showTableNumber={false}
              />
            ))}
        </div>

        {/* Quick pay button */}
        {allDelivered && group.guestId && (
          <Button
            variant='outline'
            size='sm'
            className='mt-3 w-full gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-950'
            onClick={() => onPay(group.orders[0])}
          >
            <CreditCard className='size-3.5' />
            Thanh toán · {formatCurrency(group.totalAmount)}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
