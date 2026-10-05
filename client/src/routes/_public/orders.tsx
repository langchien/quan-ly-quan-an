import { BillHistoryList, BillHistorySkeleton } from '@/components/guest/bill-history-list'
import { CallStaffButton } from '@/components/guest/call-staff-button'
import { OrdersList, OrdersListSkeleton } from '@/components/guest/orders-list'
import { PayosQrDialog } from '@/components/guest/payos-qr-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSocketEvents } from '@/hooks/use-socket-event'
import { socket } from '@/lib/socket'
import { useStatusLabel } from '@/lib/status-label'
import { useGuestBillsQuery } from '@/queries/use-bill'
import { useGuestGetOrdersQuery, useGuestLogoutMutation } from '@/queries/use-guest'
import { useAuthStore } from '@/store/useAuthStore'
import { OrderStatus, Role } from '@app/shared'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ClipboardList, LogOut, QrCode, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('guest')
  const { getOrderStatusLabel } = useStatusLabel()
  const navigate = useNavigate()
  const guest = useAuthStore(s => s.guest)
  const logout = useAuthStore(s => s.logout)

  const { data: orders, isLoading, refetch } = useGuestGetOrdersQuery()
  const { data: bills, isLoading: isBillsLoading, refetch: refetchBills } = useGuestBillsQuery()
  const logoutMutation = useGuestLogoutMutation()
  const refreshToken = useAuthStore(s => s.refreshToken)
  const [payosDialogOpen, setPayosDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('current')

  // Đơn hiện tại = chưa thanh toán (đơn Paid chuyển sang tab Lịch sử hóa đơn)
  const currentOrders = (orders ?? []).filter(
    (o: { status: string }) => o.status !== OrderStatus.Paid
  )

  // Tính toán đơn chưa thanh toán
  const unpaidOrders = (orders ?? []).filter(
    (o: { status: string }) =>
      o.status === OrderStatus.Pending ||
      o.status === OrderStatus.Processing ||
      o.status === OrderStatus.Delivered
  )
  const totalUnpaidAmount = unpaidOrders.reduce(
    (sum: number, o: { dishSnapshot: { price: number }; quantity: number }) =>
      sum + o.dishSnapshot.price * o.quantity,
    0
  )

  // Lắng nghe socket events — dùng useSocketEvents hook chuẩn hóa
  useSocketEvents({
    'update-order': updatedOrder => {
      refetch()
      const order = updatedOrder as { dishSnapshot?: { name?: string }; status?: string }
      toast.info(t('orders.updated', { name: order.dishSnapshot?.name ?? '' }), {
        description: t('orders.newStatus', {
          status: order.status ? getOrderStatusLabel(order.status) : '',
        }),
      })
    },
    payment: paidOrders => {
      refetch()
      refetchBills()
      setPayosDialogOpen(false) // Tự đóng dialog QR khi thanh toán xong
      toast.success(t('orders.paymentSuccess'), {
        description: t('orders.paymentSuccessDesc', { count: paidOrders.length }),
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
      toast.success(t('orders.loggedOut'))
    }
  }

  return (
    <main className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-1 rounded-full bg-brand' />
              <h1 className='text-2xl font-bold tracking-tight'>{t('orders.title')}</h1>
            </div>
            {guest && (
              <p className='mt-1 ml-4 text-sm text-muted-foreground'>
                <span className='font-medium'>{guest.name}</span>
                {guest.tableNumber && <> — {t('table.number', { number: guest.tableNumber })}</>}
              </p>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {/* Gọi nhân viên */}
            <CallStaffButton />

            {/* Refresh thủ công */}
            <Button
              variant='outline'
              size='icon'
              onClick={() => {
                refetch()
                refetchBills()
              }}
              disabled={isLoading}
              title={t('orders.refresh')}
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
              {logoutMutation.isPending ? t('orders.loggingOut') : t('orders.logout')}
            </Button>
          </div>
        </div>

        {/* Nội dung */}
        <Tabs value={activeTab} onValueChange={value => setActiveTab(String(value))}>
          <TabsList className='mb-4 w-full max-w-sm'>
            <TabsTrigger value='current' id='orders-tab-current'>
              {t('orders.tabCurrent')}
              {currentOrders.length > 0 && (
                <span className='rounded-full bg-brand px-1.5 text-xs text-brand-foreground'>
                  {currentOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='history' id='orders-tab-history'>
              {t('orders.tabHistory')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='current'>
            {isLoading ? (
              <OrdersListSkeleton />
            ) : currentOrders.length > 0 ? (
              <>
                <OrdersList orders={currentOrders} />

                {/* Nút thanh toán VietQR — chỉ hiện khi có đơn chưa thanh toán */}
                {unpaidOrders.length > 0 && (
                  <div className='mt-6 flex justify-center'>
                    <Button
                      size='lg'
                      className='w-full max-w-sm gap-2 bg-info text-base text-white hover:bg-info/90'
                      onClick={() => setPayosDialogOpen(true)}
                      id='pay-vietqr-btn'
                    >
                      <QrCode className='size-5' />
                      {t('orders.payVietQR')}
                    </Button>
                  </div>
                )}

                {/* Dialog QR PayOS */}
                <PayosQrDialog
                  open={payosDialogOpen}
                  onOpenChange={setPayosDialogOpen}
                  totalAmount={totalUnpaidAmount}
                  orderCount={unpaidOrders.length}
                />
              </>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <ClipboardList className='mb-4 size-12 text-muted-foreground/50' />
                <p className='text-lg font-medium text-muted-foreground'>
                  {orders && orders.length > 0 ? t('orders.allPaid') : t('orders.empty')}
                </p>
                <p className='mt-1 text-sm text-muted-foreground/70'>
                  {orders && orders.length > 0 && (
                    <>
                      <button
                        onClick={() => setActiveTab('history')}
                        className='font-medium text-primary underline-offset-4 hover:underline'
                      >
                        {t('orders.viewBillHistory')}
                      </button>{' '}
                      {t('orders.or')}{' '}
                    </>
                  )}
                  {t('orders.goTo')}{' '}
                  <button
                    onClick={() => navigate({ to: '/menu' })}
                    className='font-medium text-primary underline-offset-4 hover:underline'
                  >
                    {t('orders.orderLink')}
                  </button>{' '}
                  {t('orders.toOrder')}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value='history'>
            {isBillsLoading ? <BillHistorySkeleton /> : <BillHistoryList bills={bills ?? []} />}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
