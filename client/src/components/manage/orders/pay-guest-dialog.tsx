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
import { OrderStatus } from '@app/shared'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { usePayGuestOrdersMutation } from '@/queries/use-order'
import type { OrderSchemaType } from '@/schemaValidations/order.schema'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getOrderStatusBadge } from './order-columns'

interface PayGuestDialogProps {
  /** Một order bất kỳ của guest (dùng để lấy guestId và thông tin hiển thị) */
  order: OrderSchemaType | null
  /** Danh sách tất cả đơn chưa thanh toán của guest đó */
  pendingOrders: OrderSchemaType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayGuestDialog({ order, pendingOrders, open, onOpenChange }: PayGuestDialogProps) {
  const payMutation = usePayGuestOrdersMutation()

  const guestId = order?.guestId
  const guestName = order?.guest?.name ?? 'Khách'
  const tableNumber = order?.tableNumber ?? order?.guest?.tableNumber

  // Tính tổng tiền các đơn chưa thanh toán
  const totalAmount = pendingOrders.reduce((sum, o) => sum + o.dishSnapshot.price * o.quantity, 0)

  async function handleConfirm() {
    if (!guestId) return
    try {
      const res = await payMutation.mutateAsync({ guestId })
      toast.success(res.data.message || `Thanh toán thành công ${res.data.data.length} đơn! 🎉`)
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const isPending = payMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[420px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CreditCard className='size-5 text-violet-600' />
            Xác nhận thanh toán
          </DialogTitle>
          <DialogDescription>
            Thanh toán tất cả đơn chưa trả của{' '}
            <span className='font-medium text-foreground'>{guestName}</span>
            {tableNumber !== null && tableNumber !== undefined && <> — Bàn {tableNumber}</>}
          </DialogDescription>
        </DialogHeader>

        {/* Danh sách đơn sẽ thanh toán */}
        {pendingOrders.length > 0 && (
          <div className='max-h-60 divide-y overflow-auto rounded-lg border'>
            {pendingOrders.map(o => (
              <div key={o.id} className='flex items-center justify-between gap-3 px-3 py-2'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{o.dishSnapshot.name}</p>
                  <div className='mt-0.5 flex items-center gap-2'>
                    {getOrderStatusBadge(o.status)}
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
          <span className='font-medium'>Tổng thanh toán</span>
          <span className='text-xl font-bold text-violet-600'>{formatCurrency(totalAmount)}</span>
        </div>

        {/* Cảnh báo */}
        {pendingOrders.some(o => o.status !== OrderStatus.Delivered) && (
          <p className='text-xs text-amber-600'>
            ⚠️ Một số đơn chưa ở trạng thái &quot;Đã giao&quot;. Hệ thống vẫn sẽ thanh toán tất cả
            đơn hiện tại của khách.
          </p>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !guestId}
            className='bg-violet-600 hover:bg-violet-700'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard className='mr-2 size-4' />
                Xác nhận thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
