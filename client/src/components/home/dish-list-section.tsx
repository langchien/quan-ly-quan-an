import { Skeleton } from '@/components/ui/skeleton'
import { DishStatus } from '@/constants/type'
import { useGetDishList } from '@/queries/use-dish'
import { SearchX } from 'lucide-react'
import { DishCard } from './dish-card'

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function DishCardSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border'>
      <Skeleton className='aspect-[4/3] w-full' />
      <div className='space-y-2 p-4'>
        <Skeleton className='h-5 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
        <Skeleton className='mt-3 h-6 w-1/3' />
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className='col-span-full flex flex-col items-center justify-center py-20 text-center'>
      <SearchX className='mb-4 size-12 text-muted-foreground/50' />
      <p className='text-lg font-medium text-muted-foreground'>Chưa có món ăn nào</p>
      <p className='mt-1 text-sm text-muted-foreground/70'>
        Thực đơn sẽ được cập nhật sớm. Hãy quay lại sau nhé!
      </p>
    </div>
  )
}

// ─── Dish List Section ─────────────────────────────────────────────────────────

export function DishListSection() {
  const { data: dishes, isLoading } = useGetDishList()

  // Chỉ hiển thị món đang bán
  const availableDishes = dishes?.filter(d => d.status === DishStatus.Available) ?? []

  return (
    <section id='menu' className='container mx-auto px-4 py-12'>
      {/* Section header */}
      <div className='mb-8 flex items-center gap-3'>
        <div className='h-8 w-1 rounded-full bg-orange-500' />
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Món đang bán</h2>
          {!isLoading && (
            <p className='text-sm text-muted-foreground'>
              {availableDishes.length} món có sẵn hôm nay
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <DishCardSkeleton key={i} />)
        ) : availableDishes.length === 0 ? (
          <EmptyState />
        ) : (
          availableDishes.map(dish => <DishCard key={dish.id} dish={dish} />)
        )}
      </div>
    </section>
  )
}
