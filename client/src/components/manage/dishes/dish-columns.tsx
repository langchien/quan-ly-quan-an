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
import { DishStatus } from '@app/shared'
import type { DishType } from '@/schemaValidations/dish.schema'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { formatCurrency } from '@/lib/format'

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const DISH_STATUS_OPTIONS = [
  { value: DishStatus.Available, label: '✅ Đang bán' },
  { value: DishStatus.Unavailable, label: '⏸️ Tạm hết' },
  { value: DishStatus.Hidden, label: '🙈 Ẩn' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case DishStatus.Available:
      return <Badge variant='default'>✅ Đang bán</Badge>
    case DishStatus.Unavailable:
      return <Badge variant='secondary'>⏸️ Tạm hết</Badge>
    case DishStatus.Hidden:
      return <Badge variant='outline'>🙈 Ẩn</Badge>
    default:
      return <Badge variant='secondary'>{status}</Badge>
  }
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

    // Trạng thái
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
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
