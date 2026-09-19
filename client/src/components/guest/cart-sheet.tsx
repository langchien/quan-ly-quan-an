import { formatCurrencyVND } from '@/components/home/dish-card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { selectCartTotal, selectCartTotalItems, useCartStore } from '@/hooks/use-cart'
import { useGuestCreateOrdersMutation } from '@/queries/use-guest'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { QuantityControl } from './quantity-control'

export function CartSheet() {
  const items = useCartStore(s => s.items)
  const totalItems = useCartStore(selectCartTotalItems)
  const totalPrice = useCartStore(selectCartTotal)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const clearCart = useCartStore(s => s.clearCart)

  const createOrdersMutation = useGuestCreateOrdersMutation()

  async function handleOrder() {
    if (items.length === 0) return
    try {
      const orders = items.map(i => ({ dishId: i.dishId, quantity: i.quantity }))
      await createOrdersMutation.mutateAsync(orders)
      clearCart()
      toast.success('Đặt món thành công! 🎉', {
        description: `Đã đặt ${orders.length} món. Vui lòng đợi nhà bếp xử lý.`,
      })
    } catch {
      toast.error('Đặt món thất bại', {
        description: 'Vui lòng thử lại.',
      })
    }
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Button
          variant='outline'
          size='icon'
          className='relative'
          id='cart-trigger'
          aria-label='Mở giỏ hàng'
        >
          <ShoppingCart className='h-5 w-5' />
          {totalItems > 0 && (
            <span className='absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white'>
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className='flex flex-col gap-0 p-0'>
        <SheetHeader className='px-6 pt-6 pb-4'>
          <SheetTitle className='flex items-center gap-2 text-lg'>
            <ShoppingCart className='h-5 w-5' />
            Giỏ hàng
            {totalItems > 0 && (
              <span className='text-sm font-normal text-muted-foreground'>({totalItems} món)</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {/* Danh sách món trong giỏ */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <ShoppingCart className='mb-3 h-12 w-12 text-muted-foreground/30' />
              <p className='text-muted-foreground'>Giỏ hàng trống</p>
              <p className='mt-1 text-sm text-muted-foreground/70'>Thêm món từ thực đơn nhé!</p>
            </div>
          ) : (
            <ul className='space-y-4'>
              {items.map(item => (
                <li key={item.dishId} className='flex items-start gap-3'>
                  {/* Ảnh */}
                  <div className='h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted'>
                    {item.dishImage ? (
                      <img
                        src={item.dishImage}
                        alt={item.dishName}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-2xl'>
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Thông tin */}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{item.dishName}</p>
                    <p className='text-sm font-semibold text-primary'>
                      {formatCurrencyVND(item.price)}
                    </p>
                    <div className='mt-1.5 flex items-center justify-between'>
                      <QuantityControl
                        quantity={item.quantity}
                        onDecrease={() =>
                          item.quantity === 1
                            ? removeItem(item.dishId)
                            : updateQuantity(item.dishId, item.quantity - 1)
                        }
                        onIncrease={() => updateQuantity(item.dishId, item.quantity + 1)}
                        min={1}
                      />
                      <button
                        onClick={() => removeItem(item.dishId)}
                        className='text-muted-foreground transition-colors hover:text-destructive'
                        aria-label={`Xóa ${item.dishName} khỏi giỏ`}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer: tổng tiền + nút đặt */}
        {items.length > 0 && (
          <>
            <Separator />
            <SheetFooter className='flex-col gap-3 px-6 py-4'>
              <div className='flex items-center justify-between text-base font-semibold'>
                <span>Tổng cộng</span>
                <span className='text-primary'>{formatCurrencyVND(totalPrice)}</span>
              </div>
              <Button
                className='w-full rounded-full'
                size='lg'
                onClick={handleOrder}
                disabled={createOrdersMutation.isPending}
                id='place-order-btn'
              >
                {createOrdersMutation.isPending ? 'Đang đặt...' : `Đặt món (${totalItems})`}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
