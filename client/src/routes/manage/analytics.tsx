import { useState } from 'react'
import { format } from 'date-fns'
import { DollarSign, Users, ShoppingBag, Armchair, CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDashboardIndicator } from '@/queries/use-indicator'
import { RevenueLineChart } from '@/components/manage/dashboard/revenue-line-chart'
import { DishBarChart } from '@/components/manage/dashboard/dish-bar-chart'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useLocale } from '@/lib/i18n/use-locale'
import { Role } from '@app/shared'
import { accountMeQueryOptions } from '@/queries/use-account'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/manage/analytics')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const account = queryClient.getQueryData(accountMeQueryOptions.queryKey)
    if (account?.role !== Role.Owner) {
      throw redirect({ to: '/manage/dashboard' })
    }
  },
  component: AnalyticsPage,
})

// Date defaults
function getDefaultFromDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function getDefaultToDate() {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return now
}

function AnalyticsPage() {
  const { t } = useTranslation('manage')
  const [fromDate, setFromDate] = useState<Date>(getDefaultFromDate)
  const [toDate, setToDate] = useState<Date>(getDefaultToDate)

  const { data, isLoading } = useDashboardIndicator({ fromDate, toDate })

  const handleReset = () => {
    setFromDate(getDefaultFromDate())
    setToDate(getDefaultToDate())
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('analytics.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('analytics.description')}</p>
      </div>

      <div className='space-y-4'>
        {/* Date Range Filter */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex w-full items-center gap-2 sm:w-auto'>
            <span className='text-sm font-medium text-muted-foreground'>{t('analytics.from')}</span>
            <DatePicker
              date={fromDate}
              placeholder={t('analytics.pickDate')}
              onSelect={date => {
                if (date) {
                  date.setHours(0, 0, 0, 0)
                  setFromDate(date)
                }
              }}
            />
          </div>
          <div className='flex w-full items-center gap-2 sm:w-auto'>
            <span className='text-sm font-medium text-muted-foreground'>{t('analytics.to')}</span>
            <DatePicker
              date={toDate}
              placeholder={t('analytics.pickDate')}
              onSelect={date => {
                if (date) {
                  date.setHours(23, 59, 59, 999)
                  setToDate(date)
                }
              }}
            />
          </div>
          <Button variant='outline' onClick={handleReset}>
            {t('analytics.reset')}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className='grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4'>
          <KPICard
            title={t('analytics.totalRevenue')}
            value={data ? formatCurrency(data.revenue) : undefined}
            icon={DollarSign}
            isLoading={isLoading}
          />
          <KPICard
            title={t('analytics.guests')}
            value={data?.guestCount.toString()}
            subtitle={t('analytics.guestsSubtitle')}
            icon={Users}
            isLoading={isLoading}
          />
          <KPICard
            title={t('analytics.orders')}
            value={data?.orderCount.toString()}
            subtitle={t('analytics.ordersSubtitle')}
            icon={ShoppingBag}
            isLoading={isLoading}
          />
          <KPICard
            title={t('analytics.servingTables')}
            value={data?.servingTableCount.toString()}
            icon={Armchair}
            isLoading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className='grid gap-4 lg:grid-cols-5'>
          <div className='lg:col-span-3'>
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className='h-5 w-24' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-[300px] w-full' />
                </CardContent>
              </Card>
            ) : (
              <RevenueLineChart data={data?.revenueByDate ?? []} />
            )}
          </div>
          <div className='lg:col-span-2'>
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-40' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-[300px] w-full' />
                </CardContent>
              </Card>
            ) : (
              <DishBarChart data={data?.dishIndicator ?? []} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// KPI Card Component

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string | undefined
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className='h-8 w-24' />
        ) : (
          <div className='text-2xl font-bold'>{value ?? '0'}</div>
        )}
        {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// Date Picker Component

function DatePicker({
  date,
  placeholder,
  onSelect,
}: {
  date: Date | undefined
  placeholder?: string
  onSelect: (date: Date | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const { dateFnsLocale } = useLocale()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal sm:w-[200px]',
              !date && 'text-muted-foreground'
            )}
          />
        }
      >
        <CalendarIcon className='mr-2 h-4 w-4' />
        {date ? format(date, 'dd/MM/yyyy', { locale: dateFnsLocale }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={selectedDate => {
            onSelect(selectedDate)
            setOpen(false)
          }}
          locale={dateFnsLocale}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
