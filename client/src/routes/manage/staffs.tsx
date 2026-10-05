import { StaffTable } from '@/components/manage/staffs/staff-table'
import { accountListQueryOptions, accountMeQueryOptions } from '@/queries/use-account'
import { Role } from '@app/shared'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/manage/staffs')({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Lấy account từ cache (đã load ở /manage layout)
    const account = queryClient.getQueryData(accountMeQueryOptions.queryKey)
    if (account?.role !== Role.Owner) {
      throw redirect({ to: '/manage/dashboard' })
    }
  },
  loader: ({ context: { queryClient } }) => {
    return queryClient.query({ ...accountListQueryOptions, staleTime: 'static' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation('manage')

  return (
    <div className='flex flex-col gap-6'>
      {/* Tiêu đề trang */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('staffs.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('staffs.description')}</p>
      </div>

      {/* Bảng danh sách + dialogs */}
      <StaffTable />
    </div>
  )
}
