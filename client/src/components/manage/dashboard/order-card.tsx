import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { OrderStatus } from '@app/shared'
import type { OrderSchemaType } from '@app/shared'
import { useUpdateOrderMutation } from '@/queries/use-order'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { cn } from '@/lib/utils'
import { ChefHat, CheckCircle2, Clock, Truck, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useStatusLabel } from '@/lib/status-label'

// SLA Thresholds (phút)
const SLA_WARNING_MINUTES = 5
const SLA_DANGER_MINUTES = 15

export type OrderCardVariant = 'kanban' | 'table-item'

interface OrderCardProps {
  order: OrderSchemaType
  variant?: OrderCardVariant
  showTableNumber?: boolean
}

function getWaitMinutes(createdAt: Date | string): number {
  const created = new Date(createdAt)
  return Math.floor((Date.now() - created.getTime()) / 60000)
}

function formatWaitTime(minutes: number, t: (key: any, opts?: any) => string): string {
  if (minutes < 1) return t('dashboard.justNow')
  if (minutes < 60) return t('dashboard.minutesAgo', { minutes })
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

function getSlaClass(minutes: number, status: string): string {
  // Chỉ cảnh báo cho Pending và Processing
  if (status !== OrderStatus.Pending && status !== OrderStatus.Processing) return ''
  if (minutes >= SLA_DANGER_MINUTES) return 'animate-pulse-danger border-red-500'
  if (minutes >= SLA_WARNING_MINUTES) return 'animate-pulse-warning border-amber-500'
  return ''
}

function getSlaTimerClass(minutes: number, status: string): string {
  if (status !== OrderStatus.Pending && status !== OrderStatus.Processing) {
    return 'text-muted-foreground'
  }
  if (minutes >= SLA_DANGER_MINUTES) return 'text-red-600 font-semibold'
  if (minutes >= SLA_WARNING_MINUTES) return 'text-amber-600 font-medium'
  return 'text-muted-foreground'
}

function getNextAction(
  status: string,
  t: (key: any, opts?: any) => string
): {
  label: string
  icon: React.ReactNode
  nextStatus: string
  color: string
} | null {
  switch (status) {
    case OrderStatus.Pending:
      return {
        label: t('dashboard.actionCook'),
        icon: <ChefHat className='size-3.5' />,
        nextStatus: OrderStatus.Processing,
        color: 'bg-blue-600 hover:bg-blue-700 text-white',
      }
    case OrderStatus.Processing:
      return {
        label: t('dashboard.actionDone'),
        icon: <CheckCircle2 className='size-3.5' />,
        nextStatus: OrderStatus.Delivered,
        color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      }
    case OrderStatus.Delivered:
      return {
        label: t('dashboard.actionServed'),
        icon: <Truck className='size-3.5' />,
        nextStatus: '',
        color: 'bg-violet-600 hover:bg-violet-700 text-white',
      }
    default:
      return null
  }
}

export function OrderCard({ order, variant = 'kanban', showTableNumber = true }: OrderCardProps) {
  const { t } = useTranslation('manage')
  const updateMutation = useUpdateOrderMutation()
  const [waitMinutes, setWaitMinutes] = useState(() => getWaitMinutes(order.createdAt))

  // Timer cập nhật mỗi 30 giây
  useEffect(() => {
    setWaitMinutes(getWaitMinutes(order.createdAt))
    const interval = setInterval(() => {
      setWaitMinutes(getWaitMinutes(order.createdAt))
    }, 30_000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  const action = getNextAction(order.status, t)

  async function handleQuickAction() {
    if (!action || !action.nextStatus) return
    try {
      await updateMutation.mutateAsync({
        orderId: order.id,
        body: {
          status: action.nextStatus as any,
          dishId: order.dishSnapshot.dishId ?? 0,
          quantity: order.quantity,
        },
      })
      toast.success(t('dashboard.statusUpdated'))
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const isKanban = variant === 'kanban'
  const slaClass = getSlaClass(waitMinutes, order.status)
  const timerClass = getSlaTimerClass(waitMinutes, order.status)

  if (!isKanban) {
    // Compact variant cho hiển thị trong Table Grid
    return (
      <div className='flex items-center justify-between gap-2 py-1.5'>
        <div className='flex min-w-0 items-center gap-2'>
          <Avatar className='size-6 shrink-0 rounded'>
            <AvatarImage
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              className='object-cover'
            />
            <AvatarFallback className='rounded bg-muted text-[10px]'>
              {order.dishSnapshot.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className='truncate text-sm'>{order.dishSnapshot.name}</span>
          {order.quantity > 1 && (
            <Badge variant='secondary' className='h-4 px-1.5 text-[10px]'>
              ×{order.quantity}
            </Badge>
          )}
        </div>
        <div className='flex shrink-0 items-center gap-1.5'>
          <StatusDot status={order.status} />
          {action && (
            <Button
              size='sm'
              className={cn('h-6 gap-1 px-2 text-[11px]', action.color)}
              onClick={handleQuickAction}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <Loader2 className='size-3 animate-spin' /> : action.icon}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Kanban Card variant
  return (
    <Card
      className={cn(
        'animate-slide-in-card transition-all duration-300',
        slaClass && `border-2 ${slaClass}`
      )}
    >
      <CardContent className='space-y-2 p-3'>
        {/* Header: Dish info + Timer */}
        <div className='flex items-start gap-2.5'>
          <Avatar className='size-10 shrink-0 rounded-lg'>
            <AvatarImage
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              className='object-cover'
            />
            <AvatarFallback className='rounded-lg bg-primary/10 text-xs font-semibold text-primary'>
              {order.dishSnapshot.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{order.dishSnapshot.name}</p>
            <div className='mt-0.5 flex items-center gap-2'>
              {order.quantity > 1 && (
                <Badge variant='secondary' className='h-4 px-1.5 text-[10px]'>
                  ×{order.quantity}
                </Badge>
              )}
              {showTableNumber && order.tableNumber && (
                <span className='text-xs text-muted-foreground'>
                  {t('dashboard.tableNumber', { number: order.tableNumber })}
                </span>
              )}
            </div>
          </div>
          {/* Timer */}
          <Tooltip>
            <TooltipTrigger
              render={
                <div className={cn('flex shrink-0 items-center gap-1 text-xs', timerClass)} />
              }
            >
              <Clock className='size-3' />
              {formatWaitTime(waitMinutes, t)}
            </TooltipTrigger>
            <TooltipContent>{t('dashboard.waitTimeTooltip')}</TooltipContent>
          </Tooltip>
        </div>

        {/* Guest info */}
        {order.guest && (
          <p className='truncate text-xs text-muted-foreground'>{order.guest.name}</p>
        )}

        {/* Action button */}
        {action && (
          <Button
            size='sm'
            className={cn('h-8 w-full gap-1.5 text-xs', action.color)}
            onClick={handleQuickAction}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className='size-3.5 animate-spin' />
                {t('dashboard.processing')}
              </>
            ) : (
              <>
                {action.icon}
                {action.label}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Status Dot mini
function StatusDot({ status }: { status: string }) {
  const { getOrderStatusLabel } = useStatusLabel()
  const config: Record<string, { color: string }> = {
    [OrderStatus.Pending]: { color: 'bg-amber-500' },
    [OrderStatus.Processing]: { color: 'bg-blue-500' },
    [OrderStatus.Delivered]: { color: 'bg-emerald-500' },
    [OrderStatus.Paid]: { color: 'bg-violet-500' },
    [OrderStatus.Rejected]: { color: 'bg-red-500' },
  }
  const c = config[status] ?? { color: 'bg-gray-400' }
  const label = getOrderStatusLabel(status)
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn('inline-block size-2 shrink-0 rounded-full', c.color)} />}
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
