import { CartSheet } from '@/components/guest/cart-sheet'
import { CallStaffButton } from '@/components/guest/call-staff-button'
import { MenuDishCard } from '@/components/guest/menu-dish-card'
import { Input } from '@/components/ui/input'
import { DishStatus, Role } from '@app/shared'
import { removeDiacritics } from '@/lib/format'
import { categoryListQueryOptions, useGetCategoryList } from '@/queries/use-category'
import { dishListQueryOptions, useGetDishList } from '@/queries/use-dish'
import { useAuthStore } from '@/store/useAuthStore'
import { useSocketEvent } from '@/hooks/use-socket-event'
import { useQueryClient } from '@tanstack/react-query'
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
      queryClient.query({ ...dishListQueryOptions, staleTime: 'static' }),
      queryClient.query({ ...categoryListQueryOptions, staleTime: 'static' }),
    ]),
  component: MenuPage,
})

// Component

function MenuPage() {
  const queryClient = useQueryClient()
  const guest = useAuthStore(s => s.guest)

  // Lắng nghe socket realtime khi nhân viên đổi trạng thái món
  // → invalidate cache để danh sách món cập nhật ngay (không cần F5)
  useSocketEvent('dish-status-changed', () => {
    queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })
  })

  // Dùng live query để luôn nhận dữ liệu mới nhất sau khi socket invalidate cache
  const { data: dishesData } = useGetDishList()
  const { data: categoriesData } = useGetCategoryList()

  const dishes = dishesData ?? []
  const categories = categoriesData ?? []

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_ID)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Danh mục hiển thị nếu có ít nhất 1 dish không bị ẩn (Available hoặc Unavailable)
  const visibleCategories = useMemo(() => {
    const visibleCategoryIds = new Set(
      dishes
        .filter(d => d.status !== DishStatus.Hidden && d.categoryId != null)
        .map(d => d.categoryId)
    )
    return categories.filter(c => visibleCategoryIds.has(c.id))
  }, [dishes, categories])

  // Lọc theo category + search (chỉ ẩn các món có status === DishStatus.Hidden)
  const filteredDishes = useMemo(() => {
    let result = dishes.filter(d => d.status !== DishStatus.Hidden)

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
  const totalVisibleDishes = dishes.filter(d => d.status !== DishStatus.Hidden).length
  const hasCategories = visibleCategories.length > 0

  // Đếm món hiển thị chưa gán category
  const uncategorizedCount = useMemo(
    () => dishes.filter(d => d.status !== DishStatus.Hidden && d.categoryId == null).length,
    [dishes]
  )

  return (
    <main className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-1 rounded-full bg-brand' />
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
                count={totalVisibleDishes}
                isActive={selectedCategory === ALL_CATEGORY_ID}
                onClick={() => setSelectedCategory(ALL_CATEGORY_ID)}
              />

              {/* Tabs danh mục */}
              {visibleCategories.map(cat => {
                const count = dishes.filter(
                  d => d.status !== DishStatus.Hidden && d.categoryId === cat.id
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
            / {totalVisibleDishes} món
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
          ? 'border-brand bg-brand text-brand-foreground shadow-sm'
          : 'border-border bg-background text-muted-foreground hover:border-brand/60 hover:text-foreground'
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
