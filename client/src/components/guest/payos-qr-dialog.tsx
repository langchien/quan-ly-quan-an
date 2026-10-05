import { formatCurrencyVND } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreatePaymentLinkMutation } from '@/queries/use-bill'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useSocketEvents } from '@/hooks/use-socket-event'
import { Loader2, QrCode, CheckCircle2, Smartphone, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface PayosQrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  orderCount: number
}

type PaymentState = 'idle' | 'loading' | 'qr-ready' | 'paid'

export function PayosQrDialog({ open, onOpenChange, totalAmount, orderCount }: PayosQrDialogProps) {
  const { t } = useTranslation(['guest', 'common'])
  const [state, setState] = useState<PaymentState>('idle')
  const [qrData, setQrData] = useState<{
    billId: number
    checkoutUrl: string
    qrCode: string
    orderCode: number
  } | null>(null)

  const createPaymentLink = useCreatePaymentLinkMutation()

  // Lắng nghe socket event thanh toán hoàn tất (PayOS webhook)
  useSocketEvents({
    payment: () => {
      if (open && state === 'qr-ready') {
        setState('paid')
        toast.success(t('payos.successToast'))
      }
    },
  })

  async function handleCreatePaymentLink() {
    try {
      setState('loading')
      const res = await createPaymentLink.mutateAsync()
      setQrData(res.data.data)
      setState('qr-ready')
    } catch (error) {
      setState('idle')
      handleErrorApi({ error })
    }
  }

  function handleClose() {
    setState('idle')
    setQrData(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-[420px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <QrCode className='size-5 text-info' />
            {t('payos.title')}
          </DialogTitle>
          <DialogDescription>{t('payos.description')}</DialogDescription>
        </DialogHeader>

        {/* Trạng thái: Chưa tạo mã */}
        {state === 'idle' && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3'>
              <span className='text-sm text-muted-foreground'>
                {t('payos.itemsToPay', { count: orderCount })}
              </span>
              <span className='text-xl font-bold text-info'>{formatCurrencyVND(totalAmount)}</span>
            </div>
            <Button
              className='w-full gap-2'
              onClick={handleCreatePaymentLink}
              id='create-payment-link-btn'
            >
              <Smartphone className='size-4' />
              {t('payos.createQr')}
            </Button>
          </div>
        )}

        {/* Trạng thái: Đang tạo mã */}
        {state === 'loading' && (
          <div className='flex flex-col items-center gap-3 py-8'>
            <Loader2 className='size-8 animate-spin text-info' />
            <p className='text-sm text-muted-foreground'>{t('payos.creating')}</p>
          </div>
        )}

        {/* Trạng thái: Hiển thị QR */}
        {state === 'qr-ready' && qrData && (
          <div className='space-y-4'>
            {/* QR Code */}
            <div className='flex flex-col items-center gap-3'>
              {/* Luôn nền trắng (kể cả dark mode): mã QR cần tương phản cao để app ngân hàng quét được */}
              <div className='overflow-hidden rounded-xl border-2 border-info/30 bg-white p-3 shadow-sm'>
                {qrData.qrCode.startsWith('http') || qrData.qrCode.startsWith('data:') ? (
                  <img
                    src={qrData.qrCode}
                    alt={t('payos.qrAlt')}
                    className='size-[240px] object-contain'
                    id='payos-qr-image'
                  />
                ) : (
                  <QRCodeSVG
                    value={qrData.qrCode}
                    size={240}
                    level='M'
                    className='size-[240px]'
                    id='payos-qr-svg'
                  />
                )}
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>{t('payos.orderCode', { code: qrData.orderCode })}</span>
                {qrData.checkoutUrl && (
                  <>
                    <span>•</span>
                    <a
                      href={qrData.checkoutUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1 text-info hover:underline'
                    >
                      <span>{t('payos.openLink')}</span>
                      <ExternalLink className='size-3' />
                    </a>
                  </>
                )}
              </div>
              <p className='text-center text-xs text-muted-foreground'>{t('payos.instructions')}</p>
            </div>

            {/* Tổng tiền */}
            <div className='flex items-center justify-between rounded-lg bg-info-soft px-4 py-3'>
              <span className='font-medium'>{t('payos.totalPayment')}</span>
              <span className='text-xl font-bold text-info-soft-foreground'>
                {formatCurrencyVND(totalAmount)}
              </span>
            </div>

            {/* Lưu ý */}
            <p className='text-center text-xs text-muted-foreground'>{t('payos.autoUpdate')}</p>
          </div>
        )}

        {/* Trạng thái: Đã thanh toán */}
        {state === 'paid' && (
          <div className='flex flex-col items-center gap-3 py-8'>
            <div className='flex size-16 items-center justify-center rounded-full bg-success-soft'>
              <CheckCircle2 className='size-8 text-success-soft-foreground' />
            </div>
            <p className='text-lg font-semibold text-success-soft-foreground'>
              {t('payos.success')}
            </p>
            <p className='text-sm text-muted-foreground'>{t('payos.thanks')}</p>
          </div>
        )}

        <DialogFooter>
          {state === 'paid' ? (
            <Button onClick={handleClose} className='w-full' id='close-payment-btn'>
              {t('common:actions.close')}
            </Button>
          ) : state === 'qr-ready' ? (
            <Button variant='outline' onClick={handleClose} className='w-full'>
              {t('payos.cancel')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
