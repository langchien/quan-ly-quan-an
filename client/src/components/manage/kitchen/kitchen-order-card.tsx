import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderStatus } from '@/constants/type'
import type { OrderSchemaType } from '@/schemaValidations/order.schema'
import { useUpdateOrderMutation } from '@/queries/use-order'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { cn } from '@/lib/utils'
import { ChefHat, CheckCircle2, Clock, Loader2, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// SLA Thresholds (phút)
const SLA_WARNING_MINUTES = 5
const SLA_DANGER_MINUTES = 15

function getWaitMinutes(createdAt: Date | string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

function formatWaitTime(minutes: number): string {
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes}p`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}p` : `${h}h`
}

function getSlaLevel(minutes: number, status: string): 'normal' | 'warning' | 'danger' {
  if (status !== OrderStatus.Pending && status !== OrderStatus.Processing) return 'normal'
  if (minutes >= SLA_DANGER_MINUTES) return 'danger'
  if (minutes >= SLA_WARNING_MINUTES) return 'warning'
  return 'normal'
}

interface KitchenOrderCardProps {
  order: OrderSchemaType
}

/**
 * Card đơn món tối ưu cho màn hình bếp:
 * - Font lớn, dễ đọc từ xa
 * - Hiện rõ tên món, số lượng, ghi chú, bàn
 * - Timer SLA cảnh báo đơn chờ quá lâu
 * - Action: "Bắt đầu nấu" hoặc "Đã xong"
 */
export function KitchenOrderCard({ order }: KitchenOrderCardProps) {
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

  const slaLevel = getSlaLevel(waitMinutes, order.status)
  const isPending = order.status === OrderStatus.Pending
  const isProcessing = order.status === OrderStatus.Processing

  async function handleAction() {
    const nextStatus = isPending ? OrderStatus.Processing : OrderStatus.Delivered
    try {
      await updateMutation.mutateAsync({
        orderId: order.id,
        body: {
          status: nextStatus as any,
          dishId: order.dishSnapshot.dishId ?? 0,
          quantity: order.quantity,
        },
      })
      toast.success(isPending ? 'Đã nhận nấu!' : 'Đã hoàn thành món!')
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        slaLevel === 'danger' && 'animate-pulse-danger border-2 border-red-500',
        slaLevel === 'warning' && 'animate-pulse-warning border-2 border-amber-500'
      )}
    >
      <CardContent className='space-y-3 p-4'>
        {/* Header: Ảnh + Tên món + Số lượng */}
        <div className='flex items-start gap-3'>
          <Avatar className='size-12 shrink-0 rounded-lg'>
            <AvatarImage
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              className='object-cover'
            />
            <AvatarFallback className='rounded-lg bg-primary/10 text-sm font-bold text-primary'>
              {order.dishSnapshot.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <p className='truncate text-base font-semibold leading-tight'>
              {order.dishSnapshot.name}
            </p>
            <div className='mt-1 flex items-center gap-2'>
              <Badge variant='secondary' className='h-5 px-2 text-xs font-bold'>
                ×{order.quantity}
              </Badge>
              {order.guest && (
                <span className='truncate text-xs text-muted-foreground'>
                  {order.guest.name}
                </span>
              )}
            </div>
          </div>

          {/* Timer */}
          <div
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
              slaLevel === 'danger' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
              slaLevel === 'warning' &&
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
              slaLevel === 'normal' && 'bg-muted text-muted-foreground'
            )}
          >
            <Clock className='size-3.5' />
            {formatWaitTime(waitMinutes)}
          </div>
        </div>

        {/* Note (ghi chú) */}
        {order.note && (
          <div className='flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 dark:bg-amber-950/30'>
            <MessageSquareText className='mt-0.5 size-4 shrink-0 text-amber-600' />
            <p className='text-sm font-medium text-amber-800 dark:text-amber-300'>{order.note}</p>
          </div>
        )}

        {/* Action Button */}
        {(isPending || isProcessing) && (
          <Button
            size='lg'
            className={cn(
              'h-11 w-full gap-2 text-sm font-semibold',
              isPending && 'bg-blue-600 hover:bg-blue-700 text-white',
              isProcessing && 'bg-emerald-600 hover:bg-emerald-700 text-white'
            )}
            onClick={handleAction}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className='size-4 animate-spin' />
                Đang xử lý...
              </>
            ) : isPending ? (
              <>
                <ChefHat className='size-4' />
                Bắt đầu nấu
              </>
            ) : (
              <>
                <CheckCircle2 className='size-4' />
                Đã xong
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
