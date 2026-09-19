import { DishTable } from '@/components/manage/dishes/dish-table'
import { dishListQueryOptions } from '@/queries/use-dish'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/dishes')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(dishListQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-6'>
      {/* Tiêu đề trang */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý món ăn</h1>
        <p className='text-sm text-muted-foreground'>Quản lý thực đơn món ăn của quán</p>
      </div>

      {/* Bảng danh sách + dialogs */}
      <DishTable />
    </div>
  )
}
