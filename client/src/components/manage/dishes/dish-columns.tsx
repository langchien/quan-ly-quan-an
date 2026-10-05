import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DishStatus } from '@app/shared'
import type { DishType } from '@app/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useToggleDishStatusMutation } from '@/queries/use-dish'

import { formatCurrency } from '@/lib/format'
import { getDishStatusLabel, getDishStatusOptions, DISH_STATUS_EMOJI } from '@/lib/status-label'

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const DISH_STATUS_OPTIONS = getDishStatusOptions()

function getStatusBadge(status: string) {
  const emoji = DISH_STATUS_EMOJI[status] ?? ''
  const label = getDishStatusLabel(status)
  switch (status) {
    case DishStatus.Available:
      return (
        <Badge variant='default'>
          {emoji} {label}
        </Badge>
      )
    case DishStatus.Unavailable:
      return (
        <Badge variant='secondary'>
          {emoji} {label}
        </Badge>
      )
    case DishStatus.Hidden:
      return (
        <Badge variant='outline'>
          {emoji} {label}
        </Badge>
      )
    default:
      return <Badge variant='secondary'>{status}</Badge>
  }
}

/**
 * Nút toggle nhanh Available ↔ Unavailable.
 * Món Hidden không hiển thị nút này (cần dùng dialog Edit).
 */
function QuickToggleButton({ dish }: { dish: DishType }) {
  const toggleMutation = useToggleDishStatusMutation()
  const isPending = toggleMutation.isPending && toggleMutation.variables.id === dish.id

  if (dish.status === DishStatus.Hidden) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <span className='inline-flex cursor-not-allowed items-center gap-1 text-xs text-muted-foreground/50'>
                <EyeOff className='size-3.5' />
              </span>
            }
          />
          <TooltipContent side='left'>
            <p>Dùng nút Chỉnh sửa để thay đổi món đang Ẩn</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const nextStatus =
    dish.status === DishStatus.Available ? DishStatus.Unavailable : DishStatus.Available
  const label =
    dish.status === DishStatus.Available ? 'Đánh dấu Tạm hết' : 'Đánh dấu Đang bán trở lại'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              id={`toggle-dish-status-${dish.id}`}
              variant='ghost'
              size='icon-sm'
              disabled={isPending}
              onClick={() => toggleMutation.mutate({ id: dish.id, status: nextStatus })}
              aria-label={label}
            >
              {isPending ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : dish.status === DishStatus.Available ? (
                <EyeOff className='size-3.5 text-amber-500' />
              ) : (
                <Eye className='size-3.5 text-emerald-500' />
              )}
            </Button>
          }
        />
        <TooltipContent side='left'>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface GetDishColumnsOptions {
  onEdit: (dish: DishType) => void
  onDelete?: (dish: DishType) => void
}

export function getDishColumns({ onEdit, onDelete }: GetDishColumnsOptions): ColumnDef<DishType>[] {
  return [
    // Checkbox select
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Chọn tất cả'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Chọn dòng'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Ảnh + Tên
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Món ăn
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => {
        const dish = row.original
        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-10 rounded-lg'>
              <AvatarImage src={dish.image} alt={dish.name} className='object-cover' />
              <AvatarFallback className='rounded-lg bg-primary/10 text-xs font-semibold text-primary'>
                {getInitials(dish.name)}
              </AvatarFallback>
            </Avatar>
            <span className='font-medium'>{dish.name}</span>
          </div>
        )
      },
    },

    // Giá
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Giá
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => (
        <span className='font-medium tabular-nums'>{formatCurrency(row.getValue('price'))}</span>
      ),
    },

    // Mô tả
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => {
        const desc: string = row.getValue('description') || ''
        return (
          <span className='block max-w-[240px] truncate text-sm text-muted-foreground' title={desc}>
            {desc || <span className='italic opacity-50'>Chưa có mô tả</span>}
          </span>
        )
      },
    },

    // Danh mục
    {
      id: 'category',
      accessorFn: row => row.category?.name ?? null,
      header: 'Danh mục',
      cell: ({ row }) => {
        const category = row.original.category
        return category ? (
          <Badge variant='outline' className='font-normal'>
            {category.name}
          </Badge>
        ) : (
          <span className='text-sm text-muted-foreground/50'>—</span>
        )
      },
      filterFn: (row, _id, value: string[]) => {
        const catName = row.original.category?.name ?? '__uncategorized__'
        return value.includes(catName)
      },
    },

    // Trạng thái + Quick Toggle
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const dish = row.original
        return (
          <div className='flex items-center gap-2'>
            {getStatusBadge(dish.status)}
            <QuickToggleButton dish={dish} />
          </div>
        )
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },

    // Actions
    {
      id: 'actions',
      header: () => <span className='sr-only'>Thao tác</span>,
      cell: ({ row }) => {
        const dish = row.original
        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger
                id={`dish-actions-${dish.id}`}
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
                  <DropdownMenuItem id={`edit-dish-${dish.id}`} onClick={() => onEdit(dish)}>
                    <Pencil className='mr-2 size-4' />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem
                      id={`delete-dish-${dish.id}`}
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
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
