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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useGetGuestList } from '@/queries/use-account'
import { useGetDishList } from '@/queries/use-dish'
import { useCreateOrdersMutation } from '@/queries/use-order'
import { Loader2, Minus, Plus, ShoppingCart, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatCurrency, getInitials } from './order-columns'

interface CartItem {
  dishId: number
  dishName: string
  dishImage: string
  price: number
  quantity: number
}

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
  const [selectedGuestId, setSelectedGuestId] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedDishId, setSelectedDishId] = useState<string>('')
  const [qty, setQty] = useState(1)

  const { data: guests, isLoading: guestsLoading } = useGetGuestList()
  const { data: dishes, isLoading: dishesLoading } = useGetDishList()
  const createMutation = useCreateOrdersMutation()

  const isLoading = guestsLoading || dishesLoading

  function addToCart() {
    if (!selectedDishId) return
    const dish = dishes?.find(d => d.id === Number(selectedDishId))
    if (!dish) return

    setCart(prev => {
      const existing = prev.find(item => item.dishId === dish.id)
      if (existing) {
        return prev.map(item =>
          item.dishId === dish.id ? { ...item, quantity: item.quantity + qty } : item
        )
      }
      return [
        ...prev,
        {
          dishId: dish.id,
          dishName: dish.name,
          dishImage: dish.image,
          price: dish.price,
          quantity: qty,
        },
      ]
    })
    setSelectedDishId('')
    setQty(1)
  }

  function updateQty(dishId: number, delta: number) {
    setCart(prev =>
      prev
        .map(item => (item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0)
    )
  }

  function removeFromCart(dishId: number) {
    setCart(prev => prev.filter(item => item.dishId !== dishId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleSubmit() {
    if (!selectedGuestId) {
      toast.error('Vui lòng chọn khách hàng')
      return
    }
    if (cart.length === 0) {
      toast.error('Vui lòng thêm ít nhất một món')
      return
    }
    try {
      const res = await createMutation.mutateAsync({
        guestId: Number(selectedGuestId),
        orders: cart.map(item => ({ dishId: item.dishId, quantity: item.quantity })),
      })
      toast.success(res.data.message || `Tạo thành công ${res.data.data.length} đơn hàng`)
      handleOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedGuestId('')
      setCart([])
      setSelectedDishId('')
      setQty(1)
    }
    onOpenChange(value)
  }

  const isPending = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-[540px] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng mới</DialogTitle>
          <DialogDescription>Đặt món thay mặt khách hàng tại bàn</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-5'>
          {/* Chọn khách */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='create-order-guest'>
                <Users className='mr-1.5 inline size-4' />
                Khách hàng
              </FieldLabel>
              {guestsLoading ? (
                <div className='flex h-9 items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='size-4 animate-spin' /> Đang tải...
                </div>
              ) : (
                <Select
                  value={selectedGuestId}
                  onValueChange={val => setSelectedGuestId(val ?? '')}
                >
                  <SelectTrigger id='create-order-guest' className='w-full'>
                    <SelectValue placeholder='Chọn khách hàng' />
                  </SelectTrigger>
                  <SelectContent>
                    {(guests ?? []).length === 0 ? (
                      <SelectItem value='__empty' disabled>
                        Không có khách nào
                      </SelectItem>
                    ) : (
                      (guests ?? []).map(g => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name} {g.tableNumber !== null ? `— Bàn ${g.tableNumber}` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </FieldGroup>

          <Separator />

          {/* Chọn món */}
          <div className='space-y-3'>
            <p className='text-sm font-medium'>Thêm món ăn</p>
            <div className='flex gap-2'>
              <div className='flex-1'>
                <Select
                  value={selectedDishId}
                  onValueChange={val => setSelectedDishId(val ?? '')}
                  disabled={dishesLoading}
                >
                  <SelectTrigger id='create-order-dish' className='w-full'>
                    <SelectValue placeholder='Chọn món ăn' />
                  </SelectTrigger>
                  <SelectContent>
                    {(dishes ?? []).map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        <div className='flex items-center gap-2'>
                          <span>{d.name}</span>
                          <span className='text-xs text-muted-foreground'>
                            {formatCurrency(d.price)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='size-9 shrink-0'
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >
                  <Minus className='size-3.5' />
                </Button>
                <Input
                  type='number'
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                  className='h-9 w-14 text-center tabular-nums'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='size-9 shrink-0'
                  onClick={() => setQty(q => q + 1)}
                >
                  <Plus className='size-3.5' />
                </Button>
              </div>

              <Button
                type='button'
                onClick={addToCart}
                disabled={!selectedDishId}
                className='shrink-0'
                size='sm'
              >
                Thêm
              </Button>
            </div>
          </div>

          {/* Giỏ hàng */}
          {cart.length > 0 && (
            <>
              <Separator />
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <ShoppingCart className='size-4 text-muted-foreground' />
                  <p className='text-sm font-medium'>Giỏ hàng ({cart.length} món)</p>
                </div>
                <div className='space-y-2 rounded-lg border p-3'>
                  {cart.map(item => (
                    <div key={item.dishId} className='flex items-center gap-3'>
                      <Avatar className='size-9 shrink-0 rounded-md'>
                        <AvatarImage
                          src={item.dishImage}
                          alt={item.dishName}
                          className='object-cover'
                        />
                        <AvatarFallback className='rounded-md bg-primary/10 text-xs text-primary'>
                          {getInitials(item.dishName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>{item.dishName}</p>
                        <p className='text-xs text-muted-foreground'>
                          {formatCurrency(item.price)} × {item.quantity} ={' '}
                          <span className='font-medium text-foreground'>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </p>
                      </div>

                      <div className='flex shrink-0 items-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-7'
                          onClick={() => updateQty(item.dishId, -1)}
                        >
                          <Minus className='size-3' />
                        </Button>
                        <span className='w-6 text-center text-sm tabular-nums'>
                          {item.quantity}
                        </span>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-7'
                          onClick={() => updateQty(item.dishId, 1)}
                        >
                          <Plus className='size-3' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-7 text-destructive hover:text-destructive'
                          onClick={() => removeFromCart(item.dishId)}
                        >
                          <Trash2 className='size-3' />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator className='my-1' />
                  <div className='flex justify-between text-sm font-medium'>
                    <span>Tổng cộng</span>
                    <span className='text-primary'>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || isLoading || !selectedGuestId || cart.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Đang tạo...
              </>
            ) : (
              <>
                <ShoppingCart className='mr-2 size-4' />
                Tạo {cart.length > 0 ? `${cart.length} đơn` : 'đơn hàng'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
