import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useLiveOrders } from '@/hooks/use-live-orders'
import { LiveStatsBar } from './live-stats-bar'
import { LiveTableGrid } from './live-table-grid'
import { LiveOrderKanban } from './live-order-kanban'
import { Armchair, ChefHat } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Dashboard Vận Hành Trực Tiếp (Live Operations Hub)
 *
 * 3 tầng:
 * 1. Live Stats Bar – KPI realtime ca trực hôm nay
 * 2. View Switcher – Tabs chuyển đổi giữa Bàn ăn / Món ăn (Kanban)
 * 3. Không gian điều hành chính – LiveTableGrid hoặc LiveOrderKanban
 */
export function DashboardMain() {
  const { t } = useTranslation('manage')
  const {
    liveOrders,
    pendingCount,
    processingCount,
    servingTableCount,
    totalTableCount,
    todayRevenue,
    isLoading,
    audioChime,
  } = useLiveOrders()

  const [activeView, setActiveView] = useState<string>('tables')

  return (
    <TooltipProvider>
      <div className='space-y-4'>
        {/* Tầng 1: Live Stats Bar */}
        <LiveStatsBar
          pendingCount={pendingCount}
          processingCount={processingCount}
          servingTableCount={servingTableCount}
          totalTableCount={totalTableCount}
          todayRevenue={todayRevenue}
          isLoading={isLoading}
          isAudioEnabled={audioChime.isEnabled}
          onToggleAudio={audioChime.toggleEnabled}
        />

        {/* Tầng 2 & 3: View Switcher + Không gian điều hành */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value='tables' className='gap-1.5'>
              <Armchair className='size-4' />
              {t('dashboard.viewByTable')}
              {servingTableCount > 0 && (
                <span className='ml-1 flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary'>
                  {servingTableCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='kanban' className='gap-1.5'>
              <ChefHat className='size-4' />
              {t('dashboard.viewByDish')}
              {pendingCount + processingCount > 0 && (
                <span className='ml-1 flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-semibold text-amber-600'>
                  {pendingCount + processingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='tables'>
            <LiveTableGrid orders={liveOrders} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value='kanban'>
            <LiveOrderKanban orders={liveOrders} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
