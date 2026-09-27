import { formatCurrency } from '@/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderStatus, OrderStatusValues } from '@app/shared'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useUpdateOrderMutation } from '@/queries/use-order'
import {
  UpdateOrderBody,
  type OrderSchemaType,
  type UpdateOrderBodyType,
} from '@/schemaValidations/order.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getInitials, getOrderStatusBadge } from './order-columns'

interface UpdateOrderDialogProps {
  order: OrderSchemaType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Trạng thái hợp lệ để chuyển sang (loại trừ Paid vì dùng riêng)
const EDITABLE_STATUSES = OrderStatusValues.filter(s => s !== OrderStatus.Paid)

const STATUS_LABELS: Record<string, string> = {
  [OrderStatus.Pending]: '🕐 Chờ xử lý',
  [OrderStatus.Processing]: '🔄 Đang làm',
  [OrderStatus.Delivered]: '✅ Đã giao',
  [OrderStatus.Rejected]: '❌ Từ chối',
  [OrderStatus.Paid]: '💰 Đã thanh toán',
}

export function UpdateOrderDialog({ order, open, onOpenChange }: UpdateOrderDialogProps) {
  const updateMutation = useUpdateOrderMutation()

  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody) as any,
    defaultValues: {
      status: OrderStatus.Pending,
      dishId: 0,
      quantity: 1,
    },
  })

  const errors = form.formState.errors

  // Điền data khi dialog mở
  useEffect(() => {
    if (order) {
      form.reset({
        status: order.status,
        dishId: order.dishSnapshot.dishId ?? 0,
        quantity: order.quantity,
      })
    }
  }, [order, form])

  async function onSubmit(values: UpdateOrderBodyType) {
    if (!order) return
    try {
      const res = await updateMutation.mutateAsync({ orderId: order.id, body: values })
      toast.success(res.data.message || 'Cập nhật đơn hàng thành công')
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) form.reset()
    onOpenChange(value)
  }

  const isPending = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-[440px]'>
        <DialogHeader>
          <DialogTitle>Cập nhật đơn hàng #{order?.id}</DialogTitle>
          <DialogDescription>Chỉnh sửa trạng thái và số lượng đơn hàng</DialogDescription>
        </DialogHeader>

        {/* Thông tin đơn hàng */}
        {order && (
          <div className='flex items-center gap-3 rounded-lg border bg-muted/40 p-3'>
            <Avatar className='size-12 rounded-lg'>
              <AvatarImage
                src={order.dishSnapshot.image}
                alt={order.dishSnapshot.name}
                className='object-cover'
              />
              <AvatarFallback className='rounded-lg bg-primary/10 text-sm font-semibold text-primary'>
                {getInitials(order.dishSnapshot.name)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-0.5'>
              <p className='font-medium'>{order.dishSnapshot.name}</p>
              <p className='text-sm text-muted-foreground'>
                {order.guest?.name ?? 'Khách'} — Bàn{' '}
                {order.tableNumber ?? order.guest?.tableNumber ?? '?'}
              </p>
              <p className='text-sm font-medium text-primary'>
                {formatCurrency(order.dishSnapshot.price)} × {order.quantity}
              </p>
            </div>
            <div>{getOrderStatusBadge(order.status)}</div>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            {/* Số lượng */}
            <Field data-invalid={!!errors.quantity}>
              <FieldLabel htmlFor='update-order-quantity'>Số lượng</FieldLabel>
              <Input
                id='update-order-quantity'
                type='number'
                min={1}
                {...form.register('quantity', { valueAsNumber: true })}
                aria-invalid={!!errors.quantity}
              />
              <FieldError errors={[errors.quantity]} />
            </Field>

            {/* Trạng thái */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor='update-order-status'>Trạng thái</FieldLabel>
              <Controller
                name='status'
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id='update-order-status' className='w-full'>
                      <SelectValue placeholder='Chọn trạng thái' />
                    </SelectTrigger>
                    <SelectContent>
                      {EDITABLE_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
