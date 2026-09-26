import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Armchair, Bell, BellOff, ChefHat, Clock, DollarSign } from 'lucide-react'

import { formatCurrencyCompact } from '@/lib/format'

interface LiveStatsBarProps {
  pendingCount: number
  processingCount: number
  servingTableCount: number
  totalTableCount: number
  todayRevenue: number
  isLoading: boolean
  isAudioEnabled: boolean
  onToggleAudio: () => void
}

export function LiveStatsBar({
  pendingCount,
  processingCount,
  servingTableCount,
  totalTableCount,
  todayRevenue,
  isLoading,
  isAudioEnabled,
  onToggleAudio,
}: LiveStatsBarProps) {
  const stats = [
    {
      label: 'Bàn đang ngồi',
      value: `${servingTableCount}/${totalTableCount}`,
      icon: Armchair,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Món chờ nấu',
      value: pendingCount.toString(),
      icon: Clock,
      color: pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
      bgColor: pendingCount > 0 ? 'bg-amber-500/10' : 'bg-muted',
      highlight: pendingCount > 0,
    },
    {
      label: 'Đang nấu',
      value: processingCount.toString(),
      icon: ChefHat,
      color: processingCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground',
      bgColor: processingCount > 0 ? 'bg-blue-500/10' : 'bg-muted',
    },
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrencyCompact(todayRevenue) + ' đ',
      icon: DollarSign,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
  ]

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {/* KPI Cards */}
      <div className='grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4'>
        {stats.map(stat => (
          <Card
            key={stat.label}
            className={cn(
              'transition-all duration-300',
              stat.highlight && 'ring-2 ring-amber-400/50'
            )}
          >
            <CardContent className='flex items-center gap-3 p-3'>
              {isLoading ? (
                <>
                  <Skeleton className='size-9 rounded-lg' />
                  <div className='space-y-1'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-5 w-10' />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg',
                      stat.bgColor
                    )}
                  >
                    <stat.icon className={cn('size-4.5', stat.color)} />
                  </div>
                  <div>
                    <p className='text-[11px] leading-tight text-muted-foreground'>{stat.label}</p>
                    <p
                      className={cn('animate-count-up text-lg leading-tight font-bold', stat.color)}
                    >
                      {stat.value}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audio Toggle */}
      <Tooltip>
        <TooltipTrigger
          render={<div className='flex items-center gap-2 rounded-lg border px-3 py-2' />}
        >
          {isAudioEnabled ? (
            <Bell className='size-4 text-amber-500' />
          ) : (
            <BellOff className='size-4 text-muted-foreground' />
          )}
          <Switch size='sm' checked={isAudioEnabled} onCheckedChange={onToggleAudio} />
        </TooltipTrigger>
        <TooltipContent>{isAudioEnabled ? 'Tắt chuông báo' : 'Bật chuông báo'}</TooltipContent>
      </Tooltip>
    </div>
  )
}
