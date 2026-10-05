import { TableTable } from '@/components/manage/tables/table-table'
import { tableListQueryOptions } from '@/queries/use-table'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/manage/tables')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.query({ ...tableListQueryOptions, staleTime: 'static' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation('manage')

  return (
    <div className='flex flex-col gap-6'>
      {/* Tiêu đề trang */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('tables.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('tables.description')}</p>
      </div>

      {/* Bảng danh sách + dialogs */}
      <TableTable />
    </div>
  )
}
