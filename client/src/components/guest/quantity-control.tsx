import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface QuantityControlProps {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  min?: number
  max?: number
  className?: string
}

/**
 * Component điều chỉnh số lượng: [ - ] số [ + ]
 */
export function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
  className = '',
}: QuantityControlProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant='outline'
        size='icon'
        className='h-8 w-8 shrink-0 rounded-full'
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label='Giảm số lượng'
      >
        <Minus className='h-3 w-3' />
      </Button>

      <span className='w-8 text-center text-sm font-semibold tabular-nums'>{quantity}</span>

      <Button
        variant='outline'
        size='icon'
        className='h-8 w-8 shrink-0 rounded-full'
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label='Tăng số lượng'
      >
        <Plus className='h-3 w-3' />
      </Button>
    </div>
  )
}
