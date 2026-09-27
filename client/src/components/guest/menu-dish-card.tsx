import { formatCurrencyVND } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DishStatus } from '@app/shared'
import { useCartStore } from '@/hooks/use-cart'
import type { DishType } from '@/schemaValidations/dish.schema'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { QuantityControl } from './quantity-control'

interface MenuDishCardProps {
  dish: DishType
}

export function MenuDishCard({ dish }: MenuDishCardProps) {
  const items = useCartStore(s => s.items)
  const addItem = useCartStore(s => s.addItem)
  const updateQuantity = useCartStore(s => s.updateQuantity)
  const removeItem = useCartStore(s => s.removeItem)

  const cartItem = items.find(i => i.dishId === dish.id)
  const quantity = cartItem?.quantity ?? 0

  const [imageLoaded, setImageLoaded] = useState(false)

  function handleAdd() {
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      dishImage: dish.image,
      price: dish.price,
    })
  }

  return (
    <Card className='group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
      {/* Ảnh món ăn — Lazy Loading + Skeleton */}
      <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
        {dish.image ? (
          <>
            {/* Skeleton placeholder — ẩn khi ảnh đã tải */}
            {!imageLoaded && <Skeleton className='absolute inset-0 h-full w-full rounded-none' />}
            <img
              src={dish.image}
              alt={dish.name}
              loading='lazy'
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className='flex h-full w-full items-center justify-center text-4xl text-muted-foreground/30'>
            🍽️
          </div>
        )}
        {/* Badge trạng thái */}
        <div className='absolute top-2 right-2'>
          {dish.status === DishStatus.Available && <Badge variant='default'>Đang bán</Badge>}
        </div>
        {/* Badge số lượng trong giỏ */}
        {quantity > 0 && (
          <div className='absolute top-2 left-2'>
            <Badge variant='secondary' className='bg-orange-500 text-white hover:bg-orange-500'>
              ×{quantity}
            </Badge>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <CardContent className='p-4'>
        <h3 className='line-clamp-1 text-base leading-tight font-semibold'>{dish.name}</h3>

        {dish.description && (
          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>{dish.description}</p>
        )}

        <div className='mt-3 flex items-center justify-between gap-2'>
          <span className='text-lg font-bold text-primary'>{formatCurrencyVND(dish.price)}</span>

          {/* Nếu chưa thêm → nút Thêm, đã thêm → điều chỉnh số lượng */}
          {quantity === 0 ? (
            <Button
              size='sm'
              onClick={handleAdd}
              className='gap-1.5 rounded-full'
              aria-label={`Thêm ${dish.name} vào giỏ`}
            >
              <ShoppingCart className='h-3.5 w-3.5' />
              Thêm
            </Button>
          ) : (
            <QuantityControl
              quantity={quantity}
              onDecrease={() =>
                quantity === 1 ? removeItem(dish.id) : updateQuantity(dish.id, quantity - 1)
              }
              onIncrease={() => updateQuantity(dish.id, quantity + 1)}
              min={1}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
