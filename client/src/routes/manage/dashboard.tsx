import { DashboardMain } from '@/components/manage/dashboard/dashboard-main'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/manage/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation('manage')

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('dashboard.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('dashboard.description')}</p>
      </div>

      <DashboardMain />
    </div>
  )
}
