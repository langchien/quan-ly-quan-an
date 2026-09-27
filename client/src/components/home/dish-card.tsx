import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DishStatus } from '@app/shared'
import type { DishType } from '@/schemaValidations/dish.schema'

import { formatCurrencyVND } from '@/lib/format'

function getStatusBadge(status: string) {
  switch (status) {
    case DishStatus.Available:
      return <Badge variant='default'>Đang bán</Badge>
    case DishStatus.Unavailable:
      return <Badge variant='secondary'>Tạm hết</Badge>
    default:
      return null
  }
}

interface DishCardProps {
  dish: DishType
}

export function DishCard({ dish }: DishCardProps) {
  return (
    <Card className='group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
      {/* Ảnh món ăn */}
      <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
        {dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-4xl text-muted-foreground/30'>
            🍽️
          </div>
        )}
        {/* Badge trạng thái */}
        <div className='absolute top-2 right-2'>{getStatusBadge(dish.status)}</div>
      </div>

      {/* Nội dung */}
      <CardContent className='p-4'>
        <h3 className='line-clamp-1 text-base leading-tight font-semibold'>{dish.name}</h3>

        {dish.description && (
          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>{dish.description}</p>
        )}

        <div className='mt-3 flex items-center justify-between'>
          <span className='text-lg font-bold text-primary'>{formatCurrencyVND(dish.price)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
