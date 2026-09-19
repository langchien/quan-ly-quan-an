import { CartSheet } from '@/components/guest/cart-sheet'
import { MenuDishCard } from '@/components/guest/menu-dish-card'
import { DishStatus, Role } from '@/constants/type'
import { dishListQueryOptions } from '@/queries/use-dish'
import { useAuthStore } from '@/store/useAuthStore'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'

// ─── Route ────────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

function MenuPage() {
  const dishes = Route.useLoaderData()
  const guest = useAuthStore(s => s.guest)

  const availableDishes = dishes.filter(d => d.status === DishStatus.Available)

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

        {/* Grid món ăn */}
        {availableDishes.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <SearchX className='mb-4 size-12 text-muted-foreground/50' />
            <p className='text-lg font-medium text-muted-foreground'>Chưa có món ăn nào</p>
            <p className='mt-1 text-sm text-muted-foreground/70'>
              Thực đơn sẽ được cập nhật sớm. Hãy quay lại sau nhé!
            </p>
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
