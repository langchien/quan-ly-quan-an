import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { DishIndicatorType } from '@/schemaValidations/indicator.schema'

// Mảng màu cho các thanh bar
const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function DishBarChart({ data }: { data: DishIndicatorType[] }) {
  // Sắp xếp giảm dần theo successOrders và lấy tối đa 5 món
  const sortedData = [...data]
    .sort((a, b) => b.successOrders - a.successOrders)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }))

  const chartConfig = sortedData.reduce<ChartConfig>(
    (acc, item) => {
      acc[item.name] = {
        label: item.name,
        color: item.fill,
      }
      return acc
    },
    {
      successOrders: {
        label: 'Lượt gọi',
      },
    }
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng món ăn</CardTitle>
        <CardDescription>Được gọi nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <BarChart
            data={sortedData}
            layout='vertical'
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis type='number' hide />
            <YAxis
              dataKey='name'
              type='category'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              tickFormatter={(value: string) =>
                value.length > 12 ? value.slice(0, 12) + '…' : value
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey='name'
                  formatter={value => {
                    const num = typeof value === 'number' ? value : Number(value)
                    return [num + ' lượt', 'Đã gọi']
                  }}
                />
              }
            />
            <Bar dataKey='successOrders' radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
