import { CartSheet } from '@/components/guest/cart-sheet'
import { MenuDishCard } from '@/components/guest/menu-dish-card'
import { Input } from '@/components/ui/input'
import { DishStatus, Role } from '@/constants/type'
import { removeDiacritics } from '@/lib/format'
import { dishListQueryOptions } from '@/queries/use-dish'
import { useAuthStore } from '@/store/useAuthStore'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Search, SearchX, X } from 'lucide-react'
import { useMemo, useState } from 'react'

// Route

export const Route = createFileRoute('/_public/menu')({
  beforeLoad: () => {
    const { accessToken, guest } = useAuthStore.getState()
    if (!accessToken || guest?.role !== Role.Guest) {
      throw redirect({ to: '/' })
    }
  },
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(dishListQueryOptions),
  component: MenuPage,
})

// Component

function MenuPage() {
  const dishes = Route.useLoaderData()
  const guest = useAuthStore(s => s.guest)

  const [searchQuery, setSearchQuery] = useState('')

  const availableDishes = useMemo(() => {
    const available = dishes.filter(d => d.status === DishStatus.Available)

    if (!searchQuery.trim()) return available

    const normalizedQuery = removeDiacritics(searchQuery.trim())
    return available.filter(dish => {
      const normalizedName = removeDiacritics(dish.name)
      const normalizedDesc = removeDiacritics(dish.description)
      return normalizedName.includes(normalizedQuery) || normalizedDesc.includes(normalizedQuery)
    })
  }, [dishes, searchQuery])

  const hasSearch = searchQuery.trim().length > 0
  const totalAvailable = dishes.filter(d => d.status === DishStatus.Available).length

  return (
    <main className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-1 rounded-full bg-orange-500' />
              <h1 className='text-2xl font-bold tracking-tight'>Thực đơn</h1>
            </div>
            {guest?.tableNumber && (
              <p className='mt-1 ml-4 text-sm text-muted-foreground'>
                Bàn số <span className='font-semibold'>{guest.tableNumber}</span> —{' '}
                <span className='font-medium'>{guest.name}</span>
              </p>
            )}
          </div>

          {/* Giỏ hàng */}
          <CartSheet />
        </div>

        {/* Thanh tìm kiếm */}
        <div className='relative mb-6' id='menu-search'>
          <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Tìm món ăn...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pr-9 pl-9'
            id='menu-search-input'
            aria-label='Tìm kiếm món ăn'
          />
          {hasSearch && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground'
              aria-label='Xóa tìm kiếm'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Kết quả tìm kiếm — số lượng */}
        {hasSearch && availableDishes.length > 0 && (
          <p className='mb-4 text-sm text-muted-foreground'>
            Tìm thấy <span className='font-semibold text-foreground'>{availableDishes.length}</span>{' '}
            / {totalAvailable} món
          </p>
        )}

        {/* Grid món ăn */}
        {availableDishes.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <SearchX className='mb-4 size-12 text-muted-foreground/50' />
            {hasSearch ? (
              <>
                <p className='text-lg font-medium text-muted-foreground'>
                  Không tìm thấy món ăn nào
                </p>
                <p className='mt-1 text-sm text-muted-foreground/70'>
                  Thử tìm với từ khóa khác hoặc{' '}
                  <button
                    onClick={() => setSearchQuery('')}
                    className='font-medium text-primary underline-offset-4 hover:underline'
                  >
                    xem toàn bộ thực đơn
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className='text-lg font-medium text-muted-foreground'>Chưa có món ăn nào</p>
                <p className='mt-1 text-sm text-muted-foreground/70'>
                  Thực đơn sẽ được cập nhật sớm. Hãy quay lại sau nhé!
                </p>
              </>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {availableDishes.map(dish => (
              <MenuDishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
