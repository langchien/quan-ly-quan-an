import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useKitchenOrders } from '@/hooks/use-kitchen-orders'
import { KitchenOrderCard } from './kitchen-order-card'
import { KitchenStatsBar } from './kitchen-stats-bar'
import { ChefHat, Clock, Inbox } from 'lucide-react'
import type { OrderSchemaType } from '@/schemaValidations/order.schema'

/**
 * Render một nhóm đơn theo bàn trong cột Kanban
 */
function TableGroup({ tableNumber, orders }: { tableNumber: number; orders: OrderSchemaType[] }) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Badge variant='outline' className='text-xs font-semibold'>
          Bàn {tableNumber || '?'}
        </Badge>
        <span className='text-xs text-muted-foreground'>{orders.length} món</span>
      </div>
      {orders.map(order => (
        <KitchenOrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

/**
 * Kitchen Display System — Màn hình chính cho bếp.
 *
 * Layout 2 cột Kanban:
 * - Cột trái: Chờ nấu (Pending) — đơn mới vào, bếp bấm "Bắt đầu nấu"
 * - Cột phải: Đang nấu (Processing) — bếp đang làm, bấm "Đã xong" khi hoàn tất
 *
 * Đơn được nhóm theo bàn trong mỗi cột, sắp xếp FIFO (chờ lâu nhất lên đầu).
 */
export function KitchenMain() {
  const {
    pendingByTable,
    processingByTable,
    pendingCount,
    processingCount,
    completedToday,
    isLoading,
    audioChime,
  } = useKitchenOrders()

  const columns = [
    {
      id: 'pending',
      title: 'Chờ nấu',
      icon: <Clock className='size-5' />,
      count: pendingCount,
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      headerBg: 'bg-amber-100 dark:bg-amber-950/50',
      groups: pendingByTable,
    },
    {
      id: 'processing',
      title: 'Đang nấu',
      icon: <ChefHat className='size-5' />,
      count: processingCount,
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      headerBg: 'bg-blue-100 dark:bg-blue-950/50',
      groups: processingByTable,
    },
  ]

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div>
        <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight'>
          <ChefHat className='size-7 text-primary' />
          Bếp (KDS)
        </h1>
        <p className='text-sm text-muted-foreground'>
          Màn hình hiển thị đơn hàng cho bộ phận bếp — cập nhật realtime
        </p>
      </div>

      {/* Stats Bar */}
      <KitchenStatsBar
        pendingCount={pendingCount}
        processingCount={processingCount}
        completedToday={completedToday}
        isLoading={isLoading}
        isAudioEnabled={audioChime.isEnabled}
        onToggleAudio={audioChime.toggleEnabled}
      />

      {/* Kanban 2 columns */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : (
        <div className='grid gap-4 lg:grid-cols-2'>
          {columns.map(col => (
            <div
              key={col.id}
              className={cn(
                'flex min-h-[400px] flex-col rounded-xl border',
                col.bgColor,
                col.borderColor
              )}
            >
              {/* Column header */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-t-xl px-4 py-3',
                  col.headerBg
                )}
              >
                <div className={cn('flex items-center gap-2 text-base font-bold', col.color)}>
                  {col.icon}
                  {col.title}
                </div>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-sm font-bold',
                    col.count > 0 ? col.color : 'text-muted-foreground'
                  )}
                >
                  {col.count}
                </Badge>
              </div>

              {/* Column body — grouped by table */}
              <div className='flex-1 space-y-4 overflow-y-auto p-3'>
                {col.groups.size === 0 ? (
                  <div className='flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground/50'>
                    <Inbox className='size-12' />
                    <span className='text-sm'>Không có đơn</span>
                  </div>
                ) : (
                  Array.from(col.groups.entries())
                    .sort(([a], [b]) => a - b) // Sắp xếp theo số bàn
                    .map(([tableNumber, orders]) => (
                      <TableGroup key={tableNumber} tableNumber={tableNumber} orders={orders} />
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KanbanSkeleton() {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className='space-y-3 rounded-xl border p-4'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-28 w-full rounded-lg' />
          <Skeleton className='h-28 w-full rounded-lg' />
          <Skeleton className='h-28 w-full rounded-lg' />
        </div>
      ))}
    </div>
  )
}
