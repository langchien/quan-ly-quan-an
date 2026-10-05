import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrencyVND } from '@/lib/format'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useAuthStore } from '@/store/useAuthStore'
import type { GetGuestBillsResType } from '@app/shared'
import { PaymentMethod } from '@app/shared'
import { Banknote, ChevronRight, Download, Loader2, QrCode, Receipt } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { formatDateTime } from '@/lib/i18n/use-locale'
import { getPaymentMethodLabel } from '@/lib/status-label'
import { useTranslation } from 'react-i18next'

type Bill = GetGuestBillsResType['data'][number]
type BillOrder = Bill['orders'][number]

const paymentMethodIcons: Record<
  (typeof PaymentMethod)[keyof typeof PaymentMethod],
  typeof QrCode
> = {
  [PaymentMethod.PayOS]: QrCode,
  [PaymentMethod.Cash]: Banknote,
}

function countItems(bill: Bill) {
  return bill.orders.reduce((sum: number, o: BillOrder) => sum + o.quantity, 0)
}

export function BillHistorySkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className='flex items-center gap-4 p-4'>
            <Skeleton className='size-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-4 w-1/3' />
            </div>
            <Skeleton className='h-5 w-20' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BillCard({ bill, onSelect }: { bill: Bill; onSelect: () => void }) {
  const { t } = useTranslation(['guest', 'common'])
  const MethodIcon = paymentMethodIcons[bill.paymentMethod]

  return (
    <Card
      className='cursor-pointer transition-colors hover:bg-muted/40'
      onClick={onSelect}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      id={`bill-card-${bill.id}`}
    >
      <CardContent className='flex items-center gap-4 p-4'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'>
          <Receipt className='size-5' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='font-medium'>{t('bill.title', { code: bill.orderCode })}</p>
          <p className='text-xs text-muted-foreground'>{formatDateTime(bill.createdAt)}</p>
          <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
            <MethodIcon className='size-3' />
            <span>{getPaymentMethodLabel(bill.paymentMethod)}</span>
            <span>·</span>
            <span>{t('common:unit.item', { count: countItems(bill) })}</span>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <span className='font-semibold text-primary'>{formatCurrencyVND(bill.totalAmount)}</span>
          <ChevronRight className='size-4 text-muted-foreground' />
        </div>
      </CardContent>
    </Card>
  )
}

function BillDetailDialog({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  const { t } = useTranslation(['guest', 'common'])
  const guest = useAuthStore(s => s.guest)
  const [isExporting, setIsExporting] = useState(false)

  async function handleDownloadPdf() {
    if (!bill) return
    try {
      setIsExporting(true)
      const { downloadBillPdf } = await import('@/components/guest/bill-pdf')
      await downloadBillPdf(bill, guest?.name)
      toast.success(t('bill.downloaded', { code: bill.orderCode }))
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={!!bill} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-[440px]'>
        {bill && (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Receipt className='size-5 text-purple-600 dark:text-purple-400' />
                {t('bill.title', { code: bill.orderCode })}
              </DialogTitle>
              <DialogDescription>
                {formatDateTime(bill.createdAt)}
                {bill.tableNumber != null && (
                  <> — {t('table.short', { number: bill.tableNumber })}</>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className='max-h-[50vh] space-y-3 overflow-y-auto pr-1'>
              {bill.orders.map((order: BillOrder) => (
                <div key={order.id} className='flex items-start justify-between gap-3 text-sm'>
                  <div className='min-w-0'>
                    <p className='font-medium'>{order.dishSnapshot.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatCurrencyVND(order.dishSnapshot.price)} × {order.quantity}
                    </p>
                    {order.note && (
                      <p className='text-xs text-muted-foreground italic'>📝 {order.note}</p>
                    )}
                  </div>
                  <span className='shrink-0 font-medium'>
                    {formatCurrencyVND(order.dishSnapshot.price * order.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm text-muted-foreground'>
                <span>{t('bill.method')}</span>
                <Badge variant='outline'>{getPaymentMethodLabel(bill.paymentMethod)}</Badge>
              </div>
              <div className='flex items-center justify-between text-base font-semibold'>
                <span>{t('bill.totalWithCount', { count: countItems(bill) })}</span>
                <span className='text-primary'>{formatCurrencyVND(bill.totalAmount)}</span>
              </div>
            </div>

            <DialogFooter className='flex-row gap-2 pt-2 sm:justify-between'>
              <Button
                variant='outline'
                className='flex-1 gap-2'
                onClick={handleDownloadPdf}
                disabled={isExporting}
                id='download-bill-pdf-btn'
              >
                {isExporting ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <Download className='size-4' />
                )}
                {isExporting ? t('bill.exporting') : t('bill.download')}
              </Button>
              <Button variant='secondary' onClick={onClose} id='close-bill-dialog-btn'>
                {t('common:actions.close')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface BillHistoryListProps {
  bills: Bill[]
}

export function BillHistoryList({ bills }: BillHistoryListProps) {
  const { t } = useTranslation('guest')
  const [selected, setSelected] = useState<Bill | null>(null)

  if (bills.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <Receipt className='mb-4 size-12 text-muted-foreground/50' />
        <p className='text-lg font-medium text-muted-foreground'>{t('bill.empty')}</p>
        <p className='mt-1 text-sm text-muted-foreground/70'>{t('bill.emptyHint')}</p>
      </div>
    )
  }

  const total = bills.reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        {bills.map(bill => (
          <BillCard key={bill.id} bill={bill} onSelect={() => setSelected(bill)} />
        ))}
      </div>

      <Separator />
      <div className='flex items-center justify-between px-1 text-base font-semibold'>
        <span>{t('bill.paidSummary', { count: bills.length })}</span>
        <span className='text-primary'>{formatCurrencyVND(total)}</span>
      </div>

      <BillDetailDialog bill={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
