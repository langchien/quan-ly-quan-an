import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChefHat, Clock, CheckCircle2, Volume2, VolumeX } from 'lucide-react'

interface KitchenStatsBarProps {
  pendingCount: number
  processingCount: number
  completedToday: number
  isLoading: boolean
  isAudioEnabled: boolean
  onToggleAudio: () => void
}

/**
 * Thanh thống kê nhanh cho bếp: đếm Pending / Processing / Hoàn thành hôm nay.
 * Font lớn, dễ đọc từ xa.
 */
export function KitchenStatsBar({
  pendingCount,
  processingCount,
  completedToday,
  isLoading,
  isAudioEnabled,
  onToggleAudio,
}: KitchenStatsBarProps) {
  const stats = [
    {
      label: 'Chờ nấu',
      count: pendingCount,
      icon: <Clock className='size-5' />,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-800',
      pulse: pendingCount > 0,
    },
    {
      label: 'Đang nấu',
      count: processingCount,
      icon: <ChefHat className='size-5' />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-800',
      pulse: false,
    },
    {
      label: 'Hoàn thành',
      count: completedToday,
      icon: <CheckCircle2 className='size-5' />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      pulse: false,
    },
  ]

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='h-20 animate-pulse rounded-xl bg-muted' />
        ))}
      </div>
    )
  }

  return (
    <div className='flex items-center gap-3'>
      {/* Stats cards */}
      <div className='grid flex-1 grid-cols-1 gap-3 min-[480px]:grid-cols-3'>
        {stats.map(stat => (
          <div
            key={stat.label}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4',
              stat.bgColor,
              stat.borderColor
            )}
          >
            <div className={cn('shrink-0', stat.color)}>{stat.icon}</div>
            <div className='min-w-0'>
              <p className='text-xs font-medium text-muted-foreground'>{stat.label}</p>
              <div className='flex items-center gap-2'>
                <span className={cn('text-2xl font-bold tabular-nums', stat.color)}>
                  {stat.count}
                </span>
                {stat.pulse && stat.count > 0 && (
                  <Badge className='animate-pulse bg-amber-500 text-white'>Mới</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audio toggle */}
      <Button
        variant='outline'
        size='icon'
        className='size-10 shrink-0'
        onClick={onToggleAudio}
        title={isAudioEnabled ? 'Tắt chuông báo' : 'Bật chuông báo'}
      >
        {isAudioEnabled ? (
          <Volume2 className='size-5 text-emerald-600' />
        ) : (
          <VolumeX className='size-5 text-muted-foreground' />
        )}
      </Button>
    </div>
  )
}
