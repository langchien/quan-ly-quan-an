import { OrderTable } from '@/components/manage/orders/order-table'
import { ordersQueryOptions } from '@/queries/use-order'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/orders')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.query({ ...ordersQueryOptions(), staleTime: 'static' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý đơn hàng</h1>
        <p className='text-sm text-muted-foreground'>
          Theo dõi và xử lý các đơn gọi món của khách hàng
        </p>
      </div>

      <OrderTable />
    </div>
  )
}
