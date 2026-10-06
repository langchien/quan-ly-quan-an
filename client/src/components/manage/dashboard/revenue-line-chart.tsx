import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RevenueByDateType } from '@app/shared'
import { formatCurrency } from '@/lib/format'
import { useTranslation } from 'react-i18next'

export function RevenueLineChart({ data }: { data: RevenueByDateType[] }) {
  const { t } = useTranslation('manage')

  const chartConfig = useMemo(
    () =>
      ({
        revenue: {
          label: t('dashboard.revenue'),
          color: 'var(--chart-1)',
        },
      }) satisfies ChartConfig,
    [t]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.revenue')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => {
                // "01/07/2024" → "01"
                return value.split('/')[0]
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) =>
                value >= 1000000
                  ? `${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                    ? `${(value / 1000).toFixed(0)}K`
                    : String(value)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const item = payload[0]?.payload as RevenueByDateType | undefined
                    return item?.date ?? ''
                  }}
                  formatter={value => {
                    const num = typeof value === 'number' ? value : Number(value)
                    return [formatCurrency(num), t('dashboard.revenue')]
                  }}
                />
              }
            />
            <Line
              type='monotone'
              dataKey='revenue'
              stroke='var(--color-revenue)'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
