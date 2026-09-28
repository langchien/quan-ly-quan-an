import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatus } from '@app/shared'
import type { OrderSchemaType } from '@app/shared'
import { OrderCard } from './order-card'
import { cn } from '@/lib/utils'
import { ChefHat, CheckCircle2, Clock, Inbox } from 'lucide-react'

interface LiveOrderKanbanProps {
  orders: OrderSchemaType[]
  isLoading: boolean
}

function getWaitMinutes(createdAt: Date | string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

interface KanbanColumn {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  orders: OrderSchemaType[]
}

export function LiveOrderKanban({ orders, isLoading }: LiveOrderKanbanProps) {
  const columns = useMemo<KanbanColumn[]>(() => {
    const pending = orders
      .filter(o => o.status === OrderStatus.Pending)
      .sort((a, b) => getWaitMinutes(b.createdAt) - getWaitMinutes(a.createdAt)) // Chờ lâu nhất lên trên

    const processing = orders
      .filter(o => o.status === OrderStatus.Processing)
      .sort((a, b) => getWaitMinutes(b.createdAt) - getWaitMinutes(a.createdAt))

    const delivered = orders
      .filter(o => o.status === OrderStatus.Delivered)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return [
      {
        id: 'pending',
        title: 'Chờ nấu',
        icon: <Clock className='size-4' />,
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        orders: pending,
      },
      {
        id: 'processing',
        title: 'Đang nấu',
        icon: <ChefHat className='size-4' />,
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        orders: processing,
      },
      {
        id: 'delivered',
        title: 'Chờ bưng',
        icon: <CheckCircle2 className='size-4' />,
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        orders: delivered,
      },
    ]
  }, [orders])

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='space-y-3 rounded-xl border p-4'>
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-24 w-full rounded-lg' />
            <Skeleton className='h-24 w-full rounded-lg' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {columns.map(col => (
        <div
          key={col.id}
          className={cn(
            'min-h-[200px] space-y-3 rounded-xl border p-3',
            col.bgColor,
            col.borderColor
          )}
        >
          {/* Column header */}
          <div className='flex items-center justify-between'>
            <div className={cn('flex items-center gap-2 text-sm font-semibold', col.color)}>
              {col.icon}
              {col.title}
            </div>
            <Badge
              variant='secondary'
              className={cn('text-xs', col.orders.length > 0 ? col.color : 'text-muted-foreground')}
            >
              {col.orders.length}
            </Badge>
          </div>

          {/* Order cards */}
          <div className='space-y-2'>
            {col.orders.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/60'>
                <Inbox className='size-8' />
                <span className='text-xs'>Không có món</span>
              </div>
            ) : (
              col.orders.map(order => <OrderCard key={order.id} order={order} variant='kanban' />)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
