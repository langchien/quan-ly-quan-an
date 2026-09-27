import { OrdersList, OrdersListSkeleton } from '@/components/guest/orders-list'
import { CallStaffButton } from '@/components/guest/call-staff-button'
import { Button } from '@/components/ui/button'
import { Role } from '@/constants/type'
import { useSocketEvents } from '@/hooks/use-socket-event'
import { socket } from '@/lib/socket'
import { useGuestGetOrdersQuery, useGuestLogoutMutation } from '@/queries/use-guest'
import { useAuthStore } from '@/store/useAuthStore'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ClipboardList, LogOut, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

// Route

export const Route = createFileRoute('/_public/orders')({
  beforeLoad: () => {
    const { accessToken, guest } = useAuthStore.getState()
    if (!accessToken || guest?.role !== Role.Guest) {
      throw redirect({ to: '/' })
    }
  },
  component: OrdersPage,
})

// Component

function OrdersPage() {
  const navigate = useNavigate()
  const guest = useAuthStore(s => s.guest)
  const logout = useAuthStore(s => s.logout)

  const { data: orders, isLoading, refetch } = useGuestGetOrdersQuery()
  const logoutMutation = useGuestLogoutMutation()
  const refreshToken = useAuthStore(s => s.refreshToken)

  // Lắng nghe socket events — dùng useSocketEvents hook chuẩn hóa
  useSocketEvents({
    'update-order': updatedOrder => {
      refetch()
      const order = updatedOrder as { dishSnapshot?: { name?: string }; status?: string }
      toast.info(`Cập nhật đơn hàng: ${order.dishSnapshot?.name ?? ''}`, {
        description: `Trạng thái mới: ${order.status ?? ''}`,
      })
    },
    payment: paidOrders => {
      refetch()
      const orders = paidOrders
      toast.success('Thanh toán thành công! 🎉', {
        description: `${orders.length} món đã được thanh toán.`,
      })
    },
  })

  // Logout
  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync({ refreshToken: refreshToken ?? '' })
    } finally {
      socket.disconnect()
      logout()
      navigate({ to: '/' })
      toast.success('Đã đăng xuất thành công')
    }
  }

  return (
    <main className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-1 rounded-full bg-orange-500' />
              <h1 className='text-2xl font-bold tracking-tight'>Đơn hàng của tôi</h1>
            </div>
            {guest && (
              <p className='mt-1 ml-4 text-sm text-muted-foreground'>
                <span className='font-medium'>{guest.name}</span>
                {guest.tableNumber && (
                  <>
                    {' '}
                    — Bàn số <span className='font-semibold'>{guest.tableNumber}</span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {/* Gọi nhân viên */}
            <CallStaffButton />

            {/* Refresh thủ công */}
            <Button
              variant='outline'
              size='icon'
              onClick={() => refetch()}
              disabled={isLoading}
              title='Làm mới'
              id='refresh-orders-btn'
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Đăng xuất */}
            <Button
              variant='outline'
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className='gap-2'
              id='guest-logout-btn'
            >
              <LogOut className='h-4 w-4' />
              {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Button>
          </div>
        </div>

        {/* Nội dung */}
        {isLoading ? (
          <OrdersListSkeleton />
        ) : orders && orders.length > 0 ? (
          <OrdersList orders={orders} />
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <ClipboardList className='mb-4 size-12 text-muted-foreground/50' />
            <p className='text-lg font-medium text-muted-foreground'>Chưa có đơn hàng nào</p>
            <p className='mt-1 text-sm text-muted-foreground/70'>
              Hãy vào{' '}
              <button
                onClick={() => navigate({ to: '/menu' })}
                className='font-medium text-primary underline-offset-4 hover:underline'
              >
                Gọi món
              </button>{' '}
              để đặt món nhé!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
