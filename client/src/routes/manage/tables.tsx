import { TableTable } from '@/components/manage/tables/table-table'
import { tableListQueryOptions } from '@/queries/use-table'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/tables')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(tableListQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-6'>
      {/* Tiêu đề trang */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý bàn ăn</h1>
        <p className='text-sm text-muted-foreground'>Quản lý danh sách bàn và mã QR của quán ăn</p>
      </div>

      {/* Bảng danh sách + dialogs */}
      <TableTable />
    </div>
  )
}
