import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
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
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/analytics')({
  component: AnalyticsPage,
})

// ── Date defaults ──
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
  const [fromDate, setFromDate] = useState<Date>(getDefaultFromDate)
  const [toDate, setToDate] = useState<Date>(getDefaultToDate)

  const { data, isLoading } = useDashboardIndicator({ fromDate, toDate })

  const handleReset = () => {
    setFromDate(getDefaultFromDate())
    setToDate(getDefaultToDate())
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ'
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Phân tích & Báo cáo</h1>
        <p className='text-sm text-muted-foreground'>
          Thống kê doanh thu, đơn hàng và xếp hạng món ăn theo khoảng thời gian
        </p>
      </div>

      <div className='space-y-4'>
        {/* Date Range Filter */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-muted-foreground'>Từ</span>
            <DatePicker
              date={fromDate}
              onSelect={date => {
                if (date) {
                  date.setHours(0, 0, 0, 0)
                  setFromDate(date)
                }
              }}
            />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-muted-foreground'>Đến</span>
            <DatePicker
              date={toDate}
              onSelect={date => {
                if (date) {
                  date.setHours(23, 59, 59, 999)
                  setToDate(date)
                }
              }}
            />
          </div>
          <Button variant='outline' onClick={handleReset}>
            Reset
          </Button>
        </div>

        {/* KPI Cards */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <KPICard
            title='Tổng doanh thu'
            value={data ? formatCurrency(data.revenue) : undefined}
            icon={DollarSign}
            isLoading={isLoading}
          />
          <KPICard
            title='Khách'
            value={data?.guestCount?.toString()}
            subtitle='Gọi món'
            icon={Users}
            isLoading={isLoading}
          />
          <KPICard
            title='Đơn hàng'
            value={data?.orderCount?.toString()}
            subtitle='Đã thanh toán'
            icon={ShoppingBag}
            isLoading={isLoading}
          />
          <KPICard
            title='Bàn đang phục vụ'
            value={data?.servingTableCount?.toString()}
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

// ─── KPI Card Component ───────────────────────────────────────────────

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

// ─── Date Picker Component ────────────────────────────────────────────

function DatePicker({
  date,
  onSelect,
}: {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='outline'
            className={cn(
              'w-[200px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          />
        }
      >
        <CalendarIcon className='mr-2 h-4 w-4' />
        {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={selectedDate => {
            onSelect(selectedDate)
            setOpen(false)
          }}
          locale={vi}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
