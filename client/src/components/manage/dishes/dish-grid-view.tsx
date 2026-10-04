import { Badge } from '@/components/ui/badge'
import { buttonVariants, Button  } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DishStatus } from '@app/shared'
import type { DishType } from '@app/shared'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2, UtensilsCrossed } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useToggleDishStatusMutation } from '@/queries/use-dish'

function getStatusConfig(status: string) {
  switch (status) {
    case DishStatus.Available:
      return {
        label: 'Đang bán',
        emoji: '✅',
        dotColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        borderColor: 'border-emerald-500/20',
        ringColor: 'ring-emerald-500/30',
      }
    case DishStatus.Unavailable:
      return {
        label: 'Tạm hết',
        emoji: '⏸️',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-500/20',
        ringColor: 'ring-amber-500/30',
      }
    case DishStatus.Hidden:
      return {
        label: 'Ẩn',
        emoji: '🙈',
        dotColor: 'bg-red-500',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-500/20',
        ringColor: 'ring-red-500/30',
      }
    default:
      return {
        label: status,
        emoji: '',
        dotColor: 'bg-gray-500',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-700 dark:text-gray-400',
        borderColor: 'border-gray-500/20',
        ringColor: 'ring-gray-500/30',
      }
  }
}

interface DishGridViewProps {
  data: DishType[]
  isLoading?: boolean
  onEdit: (dish: DishType) => void
  onDelete?: (dish: DishType) => void
  globalFilter: string
  statusFilter: string[]
  categoryFilter: string[]
}

function GridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} size='sm' className='animate-pulse'>
          <Skeleton className='aspect-[4/3] w-full rounded-t-4xl' />
          <CardContent className='flex flex-col gap-2 pt-3'>
            <Skeleton className='h-5 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <div className='flex gap-2'>
              <Skeleton className='h-6 w-20' />
              <Skeleton className='h-6 w-16' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Nút toggle nhanh Available ↔ Unavailable cho Grid card.
 * Món Hidden không hiển thị nút này.
 */
function GridQuickToggle({ dish }: { dish: DishType }) {
  const toggleMutation = useToggleDishStatusMutation()
  const isPending = toggleMutation.isPending && toggleMutation.variables?.id === dish.id

  if (dish.status === DishStatus.Hidden) return null

  const nextStatus =
    dish.status === DishStatus.Available ? DishStatus.Unavailable : DishStatus.Available
  const label =
    dish.status === DishStatus.Available ? 'Đánh dấu Tạm hết' : 'Đánh dấu Đang bán trở lại'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon-sm'
            disabled={isPending}
            onClick={() => toggleMutation.mutate({ id: dish.id, status: nextStatus })}
            aria-label={label}
          >
            {isPending ? (
              <Loader2 className='size-3 animate-spin' />
            ) : dish.status === DishStatus.Available ? (
              <EyeOff className='size-3 text-amber-500' />
            ) : (
              <Eye className='size-3 text-emerald-500' />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function DishGridView({
  data,
  isLoading,
  onEdit,
  onDelete,
  globalFilter,
  statusFilter,
  categoryFilter,
}: DishGridViewProps) {
  if (isLoading) {
    return <GridSkeleton />
  }

  // Apply filters client-side (same logic as the data table)
  const filtered = data.filter(dish => {
    // Global search filter
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      const matchName = dish.name.toLowerCase().includes(q)
      const matchDesc = dish.description.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }
    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(dish.status)) {
      return false
    }
    // Category filter
    if (categoryFilter.length > 0) {
      const catName = dish.category?.name ?? '__uncategorized__'
      if (!categoryFilter.includes(catName)) return false
    }
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center'>
        <UtensilsCrossed className='size-10 text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          {globalFilter || statusFilter.length || categoryFilter.length
            ? 'Không tìm thấy kết quả phù hợp'
            : 'Chưa có món ăn nào'}
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {filtered.map(dish => {
        const status = getStatusConfig(dish.status)

        return (
          <Card
            key={dish.id}
            size='sm'
            className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:ring-2 ${status.ringColor}`}
          >
            {/* Dish image */}
            <div className='relative aspect-[4/3] overflow-hidden'>
              <img
                src={dish.image}
                alt={dish.name}
                className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
              {/* Status badge overlay */}
              <div className='absolute top-2 right-2'>
                <Badge
                  variant='outline'
                  className={`gap-1.5 backdrop-blur-sm ${status.bgColor} ${status.textColor} ${status.borderColor} bg-opacity-90`}
                >
                  <span className={`size-1.5 rounded-full ${status.dotColor}`} />
                  {status.label}
                </Badge>
              </div>
              {/* Price overlay */}
              <div className='absolute bottom-2 left-2'>
                <Badge className='bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90'>
                  {formatCurrency(dish.price)}
                </Badge>
              </div>
            </div>

            <CardHeader className='pt-3 pb-0'>
              <CardTitle className='line-clamp-1 text-base'>{dish.name}</CardTitle>

              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    id={`grid-dish-actions-${dish.id}`}
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon-sm',
                      className: 'data-[state=open]:bg-muted',
                    })}
                  >
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>Mở menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-40'>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(dish)}>
                        <Pencil className='mr-2 size-4' />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(dish)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='mr-2 size-4' />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>

            <CardContent className='pb-0'>
              <p className='line-clamp-2 text-xs text-muted-foreground'>
                {dish.description || <span className='italic opacity-50'>Chưa có mô tả</span>}
              </p>
              {dish.category && (
                <Badge variant='outline' className='mt-1.5 text-[10px] font-normal'>
                  {dish.category.name}
                </Badge>
              )}
            </CardContent>

            <CardFooter className='justify-between border-t pt-3'>
              <p className='text-xs text-muted-foreground'>
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(dish.createdAt))}
              </p>
              <div className='flex items-center gap-1.5'>
                {/* Quick Toggle button */}
                <GridQuickToggle dish={dish} />
                <span className='text-sm font-semibold text-primary'>
                  {formatCurrency(dish.price)}
                </span>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
