import { formatCurrencyVND } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { selectCartTotal, selectCartTotalItems, useCartStore } from '@/hooks/use-cart'
import { useGetDishList } from '@/queries/use-dish'
import { useGuestCreateOrdersMutation } from '@/queries/use-guest'
import { DishStatus } from '@app/shared'
import { AlertCircle, MessageSquare, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { QuantityControl } from './quantity-control'

export function CartSheet() {
  const items = useCartStore(s => s.items)
  const totalItems = useCartStore(selectCartTotalItems)
  const totalPrice = useCartStore(selectCartTotal)
  const removeItem = useCartStore(s => s.removeItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const updateNote = useCartStore(s => s.updateNote)
  const clearCart = useCartStore(s => s.clearCart)

  const { data: dishes } = useGetDishList()
  const createOrdersMutation = useGuestCreateOrdersMutation()

  // Track which items have the note input expanded
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set())

  // Map kiểm tra trạng thái món ăn mới nhất
  const dishStatusMap = useMemo(() => {
    const map = new Map<number, string>()
    dishes?.forEach(d => map.set(d.id, d.status))
    return map
  }, [dishes])

  // Danh sách ID các món trong giỏ hiện đang bị Tạm hết hoặc Ẩn
  const unavailableDishIds = useMemo(() => {
    return items
      .filter(item => {
        const status = dishStatusMap.get(item.dishId)
        return status === DishStatus.Unavailable || status === DishStatus.Hidden
      })
      .map(item => item.dishId)
  }, [items, dishStatusMap])

  const hasUnavailableItems = unavailableDishIds.length > 0

  function removeUnavailableItems() {
    unavailableDishIds.forEach(id => removeItem(id))
    toast.info(`Đã xóa ${unavailableDishIds.length} món tạm hết khỏi giỏ hàng`)
  }

  function toggleNoteExpand(dishId: number) {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      if (next.has(dishId)) {
        next.delete(dishId)
      } else {
        next.add(dishId)
      }
      return next
    })
  }

  async function handleOrder() {
    if (items.length === 0 || hasUnavailableItems) return
    try {
      const orders = items.map(i => ({
        dishId: i.dishId,
        quantity: i.quantity,
        ...(i.note?.trim() ? { note: i.note.trim() } : {}),
      }))
      await createOrdersMutation.mutateAsync(orders)
      clearCart()
      setExpandedNotes(new Set())
      toast.success('Đặt món thành công! 🎉', {
        description: `Đã đặt ${orders.length} món. Vui lòng đợi nhà bếp xử lý.`,
      })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMsg = err.response?.data?.message || err.message || 'Vui lòng thử lại.'
      toast.error('Đặt món thất bại', {
        description: errorMsg,
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

        {/* Banner cảnh báo khi có món tạm hết */}
        {hasUnavailableItems && (
          <div className='mx-6 mt-3 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'>
            <div className='flex items-center gap-1.5 font-medium'>
              <AlertCircle className='size-4 shrink-0 text-amber-600 dark:text-amber-400' />
              <span>Có {unavailableDishIds.length} món trong giỏ hiện tạm hết</span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={removeUnavailableItems}
              className='h-7 text-xs font-semibold text-amber-900 hover:bg-amber-200 dark:text-amber-200 dark:hover:bg-amber-900/50'
            >
              Xóa món hết
            </Button>
          </div>
        )}

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
              {items.map(item => {
                const isNoteExpanded = expandedNotes.has(item.dishId)
                const hasNote = !!item.note?.trim()
                const isItemUnavailable = unavailableDishIds.includes(item.dishId)

                return (
                  <li
                    key={item.dishId}
                    className={`space-y-2 rounded-lg p-2 transition-colors ${
                      isItemUnavailable
                        ? 'border border-amber-200 bg-amber-50/50 opacity-80 dark:border-amber-900/30 dark:bg-amber-950/20'
                        : ''
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Ảnh */}
                      <div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted'>
                        {item.dishImage ? (
                          <img
                            src={item.dishImage}
                            alt={item.dishName}
                            className={`h-full w-full object-cover ${
                              isItemUnavailable ? 'grayscale-[50%]' : ''
                            }`}
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center text-2xl'>
                            🍽️
                          </div>
                        )}
                        {isItemUnavailable && (
                          <div className='absolute inset-0 flex items-center justify-center bg-background/60'>
                            <span className='text-[10px] font-bold text-amber-600 dark:text-amber-400'>
                              Hết
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Thông tin */}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-1.5'>
                          <p className='truncate text-sm font-medium'>{item.dishName}</p>
                          {isItemUnavailable && (
                            <Badge
                              variant='secondary'
                              className='h-4 border-amber-500/30 bg-amber-500/10 px-1 text-[10px] font-normal text-amber-700 dark:text-amber-400'
                            >
                              Tạm hết
                            </Badge>
                          )}
                        </div>
                        <p className='text-sm font-semibold text-primary'>
                          {formatCurrencyVND(item.price)}
                        </p>
                        <div className='mt-1.5 flex items-center justify-between'>
                          {isItemUnavailable ? (
                            <span className='text-xs font-medium text-amber-600 dark:text-amber-400'>
                              Số lượng: {item.quantity} (Tạm hết)
                            </span>
                          ) : (
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
                          )}
                          <div className='flex items-center gap-1'>
                            {/* Nút toggle ghi chú */}
                            {!isItemUnavailable && (
                              <button
                                onClick={() => toggleNoteExpand(item.dishId)}
                                className={`rounded-full p-1 transition-colors ${
                                  isNoteExpanded || hasNote
                                    ? 'text-orange-500 hover:text-orange-600'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                                aria-label={`Ghi chú cho ${item.dishName}`}
                                title='Thêm ghi chú'
                              >
                                <MessageSquare className='h-4 w-4' />
                              </button>
                            )}
                            <button
                              onClick={() => removeItem(item.dishId)}
                              className='text-muted-foreground transition-colors hover:text-destructive'
                              aria-label={`Xóa ${item.dishName} khỏi giỏ`}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ô ghi chú (mở rộng) */}
                    {isNoteExpanded && (
                      <div className='ml-[76px]'>
                        <Textarea
                          placeholder='Ví dụ: không hành, ít cay, thêm ớt...'
                          value={item.note ?? ''}
                          onChange={e => updateNote(item.dishId, e.target.value)}
                          maxLength={200}
                          rows={2}
                          className='resize-none text-sm'
                          id={`cart-note-${item.dishId}`}
                        />
                        <p className='mt-1 text-right text-[11px] text-muted-foreground/60'>
                          {item.note?.length ?? 0}/200
                        </p>
                      </div>
                    )}

                    {/* Hiển thị ghi chú thu gọn khi không expanded */}
                    {!isNoteExpanded && hasNote && (
                      <button
                        onClick={() => toggleNoteExpand(item.dishId)}
                        className='ml-[76px] flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-700 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50'
                      >
                        <MessageSquare className='h-3 w-3' />
                        <span className='max-w-[200px] truncate'>{item.note}</span>
                      </button>
                    )}
                  </li>
                )
              })}
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
              {hasUnavailableItems && (
                <p className='text-center text-xs font-medium text-amber-600 dark:text-amber-400'>
                  ⚠️ Vui lòng xóa món tạm hết trước khi đặt món
                </p>
              )}
              <Button
                className='w-full rounded-full'
                size='lg'
                onClick={handleOrder}
                disabled={createOrdersMutation.isPending || hasUnavailableItems}
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
