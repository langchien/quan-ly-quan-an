import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderStatus } from '@app/shared'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { usePayGuestOrdersMutation } from '@/queries/use-order'
import { useManagerCreatePaymentLinkMutation } from '@/queries/use-bill'
import { useSocketEvents } from '@/hooks/use-socket-event'
import type { OrderSchemaType } from '@app/shared'
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  QrCode,
  Smartphone,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useStatusLabel } from '@/lib/status-label'
import { getOrderStatusBadge } from './order-columns'

interface PayGuestDialogProps {
  /** Một order bất kỳ của guest (dùng để lấy guestId và thông tin hiển thị) */
  order: OrderSchemaType | null
  /** Danh sách tất cả đơn chưa thanh toán của guest đó */
  pendingOrders: OrderSchemaType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type QrPaymentState = 'idle' | 'loading' | 'ready' | 'paid'

export function PayGuestDialog({ order, pendingOrders, open, onOpenChange }: PayGuestDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const { getOrderStatusLabel } = useStatusLabel()
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vietqr'>('cash')
  const [qrState, setQrState] = useState<QrPaymentState>('idle')
  const [qrData, setQrData] = useState<{
    billId: number
    checkoutUrl: string
    qrCode: string
    orderCode: number
  } | null>(null)

  const payCashMutation = usePayGuestOrdersMutation()
  const createPaymentLink = useManagerCreatePaymentLinkMutation()

  const guestId = order?.guestId
  const guestName =
    order?.guest?.name ?? t('orders.payDialog.defaultGuestName', { defaultValue: 'Khách' })
  const tableNumber = order?.tableNumber ?? order?.guest?.tableNumber

  // Tính tổng tiền các đơn chưa thanh toán
  const totalAmount = pendingOrders.reduce((sum, o) => sum + o.dishSnapshot.price * o.quantity, 0)

  // Lắng nghe socket event thanh toán hoàn tất (PayOS webhook bắn về)
  useSocketEvents({
    payment: () => {
      if (open && qrState === 'ready') {
        setQrState('paid')
        toast.success(
          t('orders.payDialog.vietQrSuccess', {
            defaultValue: 'Khách đã thanh toán qua VietQR thành công! 🎉',
          })
        )
      }
    },
  })

  // Xử lý thanh toán tiền mặt
  async function handleConfirmCash() {
    if (!guestId) return
    try {
      const res = await payCashMutation.mutateAsync({ guestId })
      toast.success(
        res.data.message ||
          t('orders.payDialog.cashSuccess', {
            count: res.data.data.length,
            defaultValue: `Thanh toán thành công ${res.data.data.length} đơn! 🎉`,
          })
      )
      handleClose()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  // Xử lý tạo mã VietQR
  async function handleGenerateQr() {
    if (!guestId) return
    try {
      setQrState('loading')
      const res = await createPaymentLink.mutateAsync({ guestId })
      setQrData(res.data.data)
      setQrState('ready')
    } catch (error) {
      setQrState('idle')
      handleErrorApi({ error })
    }
  }

  function handleClose() {
    setPaymentMethod('cash')
    setQrState('idle')
    setQrData(null)
    onOpenChange(false)
  }

  const isPendingCash = payCashMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-[460px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CreditCard className='size-5 text-violet-600' />
            {t('orders.payDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('common:table.tableNumber', {
              number: tableNumber ?? 'N/A',
              defaultValue: `Bàn ${tableNumber ?? 'N/A'}`,
            })}{' '}
            — <span className='font-medium text-foreground'>{guestName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Tab chọn hình thức thanh toán */}
        <Tabs
          value={paymentMethod}
          onValueChange={v => setPaymentMethod(v as 'cash' | 'vietqr')}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='cash' className='gap-1.5'>
              <Banknote className='size-4' />
              {t('orders.payDialog.cashTab', { defaultValue: 'Tiền mặt' })}
            </TabsTrigger>
            <TabsTrigger value='vietqr' className='gap-1.5'>
              <QrCode className='size-4' />
              {t('orders.payDialog.vietQrTab', { defaultValue: 'VietQR (PayOS)' })}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TIỀN MẶT */}
          <TabsContent value='cash' className='space-y-4 pt-3'>
            {/* Danh sách đơn sẽ thanh toán */}
            {pendingOrders.length > 0 && (
              <div className='max-h-52 divide-y overflow-auto rounded-lg border'>
                {pendingOrders.map(o => (
                  <div key={o.id} className='flex items-center justify-between gap-3 px-3 py-2'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>{o.dishSnapshot.name}</p>
                      <div className='mt-0.5 flex items-center gap-2'>
                        {getOrderStatusBadge(o.status, getOrderStatusLabel)}
                        <span className='text-xs text-muted-foreground'>× {o.quantity}</span>
                      </div>
                    </div>
                    <span className='shrink-0 text-sm font-medium tabular-nums'>
                      {formatCurrency(o.dishSnapshot.price * o.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tổng tiền */}
            <div className='flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3'>
              <span className='font-medium'>
                {t('orders.payDialog.cashTotalLabel', { defaultValue: 'Tổng tiền mặt cần thu' })}
              </span>
              <span className='text-xl font-bold text-violet-600'>
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Cảnh báo món chưa giao */}
            {pendingOrders.some(o => o.status !== OrderStatus.Delivered) && (
              <p className='text-xs text-amber-600'>
                {t('orders.payDialog.undeliveredWarning', {
                  defaultValue:
                    '⚠️ Một số đơn chưa ở trạng thái "Đã giao". Hệ thống vẫn sẽ thanh toán tất cả đơn hiện tại của khách.',
                })}
              </p>
            )}

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button variant='outline' onClick={handleClose} disabled={isPendingCash}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                onClick={handleConfirmCash}
                disabled={isPendingCash || !guestId}
                className='bg-emerald-600 hover:bg-emerald-700'
                id='confirm-cash-payment-btn'
              >
                {isPendingCash ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    {t('orders.payDialog.cashProcessing', { defaultValue: 'Đang xử lý...' })}
                  </>
                ) : (
                  <>
                    <Banknote className='mr-2 size-4' />
                    {t('orders.payDialog.confirmCash', {
                      defaultValue: 'Xác nhận đã nhận tiền mặt',
                    })}
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 2: VIETQR (PAYOS) */}
          <TabsContent value='vietqr' className='space-y-4 pt-3'>
            {/* Trạng thái: Chưa tạo mã */}
            {qrState === 'idle' && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-950/30'>
                  <span className='text-sm text-muted-foreground'>
                    {t('orders.payDialog.itemsToPay', {
                      count: pendingOrders.length,
                      defaultValue: `${pendingOrders.length} món cần thanh toán`,
                    })}
                  </span>
                  <span className='text-xl font-bold text-blue-600'>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <Button
                  className='w-full gap-2 bg-blue-600 hover:bg-blue-700'
                  onClick={handleGenerateQr}
                  disabled={!guestId}
                  id='generate-vietqr-btn'
                >
                  <Smartphone className='size-4' />
                  {t('orders.payDialog.generateQr', {
                    table: tableNumber ?? '',
                    defaultValue: `Tạo mã VietQR cho bàn ${tableNumber ?? ''}`,
                  })}
                </Button>
              </div>
            )}

            {/* Trạng thái: Đang tạo mã */}
            {qrState === 'loading' && (
              <div className='flex flex-col items-center gap-3 py-8'>
                <Loader2 className='size-8 animate-spin text-blue-600' />
                <p className='text-sm text-muted-foreground'>
                  {t('orders.payDialog.creatingQr', {
                    defaultValue: 'Đang tạo mã QR VietQR từ PayOS...',
                  })}
                </p>
              </div>
            )}

            {/* Trạng thái: Đã có mã QR */}
            {qrState === 'ready' && qrData && (
              <div className='space-y-3'>
                <div className='flex flex-col items-center gap-2'>
                  <div className='overflow-hidden rounded-xl border-2 border-blue-200 bg-white p-3 shadow-sm'>
                    {qrData.qrCode.startsWith('http') || qrData.qrCode.startsWith('data:') ? (
                      <img
                        src={qrData.qrCode}
                        alt={t('orders.payDialog.qrAlt', { defaultValue: 'Mã QR VietQR' })}
                        className='size-[220px] object-contain'
                        id='manage-payos-qr-image'
                      />
                    ) : (
                      <QRCodeSVG
                        value={qrData.qrCode}
                        size={220}
                        level='M'
                        className='size-[220px]'
                        id='manage-payos-qr-svg'
                      />
                    )}
                  </div>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span>
                      {t('orders.payDialog.orderCode', {
                        code: qrData.orderCode,
                        defaultValue: `Mã đơn: #${qrData.orderCode}`,
                      })}
                    </span>
                    {qrData.checkoutUrl && (
                      <>
                        <span>•</span>
                        <a
                          href={qrData.checkoutUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='inline-flex items-center gap-1 text-blue-600 hover:underline'
                        >
                          <span>
                            {t('orders.payDialog.openPayOs', { defaultValue: 'Mở link PayOS' })}
                          </span>
                          <ExternalLink className='size-3' />
                        </a>
                      </>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('orders.payDialog.scanHint', {
                      defaultValue: 'Đưa mã này cho khách quét bằng App ngân hàng bất kỳ',
                    })}
                  </p>
                </div>

                <div className='flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2.5 dark:bg-blue-950/30'>
                  <span className='text-sm font-medium'>
                    {t('orders.payDialog.amount', { defaultValue: 'Số tiền' })}
                  </span>
                  <span className='text-lg font-bold text-blue-600'>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <p className='animate-pulse text-center text-xs text-muted-foreground'>
                  {t('orders.payDialog.waitingPayment', {
                    defaultValue: '⏳ Đang chờ khách thanh toán (hệ thống tự động nhận diện)...',
                  })}
                </p>
              </div>
            )}

            {/* Trạng thái: Đã thanh toán */}
            {qrState === 'paid' && (
              <div className='flex flex-col items-center gap-3 py-6'>
                <div className='flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50'>
                  <CheckCircle2 className='size-8 text-emerald-600' />
                </div>
                <p className='text-lg font-semibold text-emerald-600'>
                  {t('orders.payDialog.successTitle', { defaultValue: 'Thanh toán thành công!' })}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('orders.payDialog.successDesc', {
                    defaultValue: 'Đã nhận tiền qua VietQR, đơn hàng đã được cập nhật.',
                  })}
                </p>
              </div>
            )}

            <DialogFooter>
              {qrState === 'paid' ? (
                <Button
                  onClick={handleClose}
                  className='w-full bg-emerald-600 hover:bg-emerald-700'
                >
                  {t('common:actions.confirm', { defaultValue: 'Hoàn tất' })}
                </Button>
              ) : (
                <Button variant='outline' onClick={handleClose} className='w-full'>
                  {qrState === 'ready'
                    ? t('orders.payDialog.closeQr', { defaultValue: 'Đóng mã QR' })
                    : t('common:actions.cancel')}
                </Button>
              )}
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
