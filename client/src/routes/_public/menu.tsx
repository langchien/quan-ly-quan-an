import { CartSheet } from '@/components/guest/cart-sheet'
import { CallStaffButton } from '@/components/guest/call-staff-button'
import { MenuDishCard } from '@/components/guest/menu-dish-card'
import { Input } from '@/components/ui/input'
import { DishStatus, Role } from '@app/shared'
import { removeDiacritics } from '@/lib/format'
import { categoryListQueryOptions } from '@/queries/use-category'
import { dishListQueryOptions } from '@/queries/use-dish'
import { useAuthStore } from '@/store/useAuthStore'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Search, SearchX, X } from 'lucide-react'
import { useRef, useMemo, useState } from 'react'

// Constants
const ALL_CATEGORY_ID = '__all__' as const

// Route

export const Route = createFileRoute('/_public/menu')({
  beforeLoad: () => {
    const { accessToken, guest } = useAuthStore.getState()
    if (!accessToken || guest?.role !== Role.Guest) {
      throw redirect({ to: '/' })
    }
  },
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(dishListQueryOptions),
      queryClient.ensureQueryData(categoryListQueryOptions),
    ]),
  component: MenuPage,
})

// Component

function MenuPage() {
  const [dishes, categories] = Route.useLoaderData()
  const guest = useAuthStore(s => s.guest)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_ID)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Danh mục chỉ hiển thị nếu có ít nhất 1 dish Available thuộc category đó
  const visibleCategories = useMemo(() => {
    const availableDishCategoryIds = new Set(
      dishes
        .filter(d => d.status === DishStatus.Available && d.categoryId != null)
        .map(d => d.categoryId)
    )
    return categories.filter(c => availableDishCategoryIds.has(c.id))
  }, [dishes, categories])

  // Lọc theo category + search
  const filteredDishes = useMemo(() => {
    let result = dishes.filter(d => d.status === DishStatus.Available)

    // Lọc theo category
    if (selectedCategory === 'uncategorized') {
      result = result.filter(d => d.categoryId == null)
    } else if (selectedCategory !== ALL_CATEGORY_ID) {
      const categoryId = Number(selectedCategory)
      result = result.filter(d => d.categoryId === categoryId)
    }

    // Lọc theo search query
    if (searchQuery.trim()) {
      const normalizedQuery = removeDiacritics(searchQuery.trim())
      result = result.filter(dish => {
        const normalizedName = removeDiacritics(dish.name)
        const normalizedDesc = removeDiacritics(dish.description)
        return normalizedName.includes(normalizedQuery) || normalizedDesc.includes(normalizedQuery)
      })
    }

    return result
  }, [dishes, searchQuery, selectedCategory])

  const hasSearch = searchQuery.trim().length > 0
  const totalAvailable = dishes.filter(d => d.status === DishStatus.Available).length
  const hasCategories = visibleCategories.length > 0

  // Đếm món available chưa gán category
  const uncategorizedCount = useMemo(
    () => dishes.filter(d => d.status === DishStatus.Available && d.categoryId == null).length,
    [dishes]
  )

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

          {/* Giỏ hàng + Gọi nhân viên */}
          <div className='flex items-center gap-2'>
            <CallStaffButton />
            <CartSheet />
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className='relative mb-4' id='menu-search'>
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

        {/* Category Tabs — chỉ hiển thị khi có categories */}
        {hasCategories && (
          <div className='mb-6' id='menu-category-tabs'>
            <div
              ref={scrollRef}
              className='scrollbar-hide flex gap-2 overflow-x-auto pb-2'
              role='tablist'
              aria-label='Lọc theo danh mục'
            >
              {/* Tab "Tất cả" */}
              <CategoryTab
                label='Tất cả'
                count={totalAvailable}
                isActive={selectedCategory === ALL_CATEGORY_ID}
                onClick={() => setSelectedCategory(ALL_CATEGORY_ID)}
              />

              {/* Tabs danh mục */}
              {visibleCategories.map(cat => {
                const count = dishes.filter(
                  d => d.status === DishStatus.Available && d.categoryId === cat.id
                ).length
                return (
                  <CategoryTab
                    key={cat.id}
                    label={cat.name}
                    count={count}
                    isActive={selectedCategory === String(cat.id)}
                    onClick={() => setSelectedCategory(String(cat.id))}
                  />
                )
              })}

              {/* Tab "Khác" — nếu có món chưa gán category */}
              {uncategorizedCount > 0 && visibleCategories.length > 0 && (
                <CategoryTab
                  label='Khác'
                  count={uncategorizedCount}
                  isActive={selectedCategory === 'uncategorized'}
                  onClick={() => setSelectedCategory('uncategorized')}
                />
              )}
            </div>
          </div>
        )}

        {/* Kết quả tìm kiếm — số lượng */}
        {(hasSearch || selectedCategory !== ALL_CATEGORY_ID) && filteredDishes.length > 0 && (
          <p className='mb-4 text-sm text-muted-foreground'>
            Hiển thị <span className='font-semibold text-foreground'>{filteredDishes.length}</span>{' '}
            / {totalAvailable} món
          </p>
        )}

        {/* Grid món ăn */}
        {filteredDishes.length === 0 ? (
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
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory(ALL_CATEGORY_ID)
                    }}
                    className='font-medium text-primary underline-offset-4 hover:underline'
                  >
                    xem toàn bộ thực đơn
                  </button>
                </p>
              </>
            ) : selectedCategory !== ALL_CATEGORY_ID ? (
              <>
                <p className='text-lg font-medium text-muted-foreground'>
                  Danh mục này chưa có món ăn
                </p>
                <p className='mt-1 text-sm text-muted-foreground/70'>
                  <button
                    onClick={() => setSelectedCategory(ALL_CATEGORY_ID)}
                    className='font-medium text-primary underline-offset-4 hover:underline'
                  >
                    Xem tất cả món
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
            {filteredDishes.map(dish => (
              <MenuDishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// Sub-components

interface CategoryTabProps {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}

function CategoryTab({ label, count, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      role='tab'
      aria-selected={isActive}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
          : 'border-border bg-background text-muted-foreground hover:border-orange-300 hover:text-foreground'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold ${
          isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
