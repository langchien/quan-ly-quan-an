import { OrderTable } from '@/components/manage/orders/order-table'
import { ordersQueryOptions } from '@/queries/use-order'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/manage/orders')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.query({ ...ordersQueryOptions(), staleTime: 'static' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation('manage')

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{t('orders.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('orders.description')}</p>
      </div>

      <OrderTable />
    </div>
  )
}
