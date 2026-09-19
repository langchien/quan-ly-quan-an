import { StaffTable } from '@/components/manage/staffs/staff-table'
import { accountListQueryOptions } from '@/queries/use-account'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/staffs')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(accountListQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-6'>
      {/* Tiêu đề trang */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý nhân viên</h1>
        <p className='text-sm text-muted-foreground'>Quản lý tài khoản nhân viên của quán ăn</p>
      </div>

      {/* Bảng danh sách + dialogs */}
      <StaffTable />
    </div>
  )
}
