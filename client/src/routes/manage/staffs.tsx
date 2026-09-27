import { StaffTable } from '@/components/manage/staffs/staff-table'
import { Role } from '@app/shared'
import { accountListQueryOptions, accountMeQueryOptions } from '@/queries/use-account'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/staffs')({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Lấy account từ cache (đã load ở /manage layout)
    const account = queryClient.getQueryData(accountMeQueryOptions.queryKey)
    if (account?.role !== Role.Owner) {
      throw redirect({ to: '/manage/dashboard' })
    }
  },
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
