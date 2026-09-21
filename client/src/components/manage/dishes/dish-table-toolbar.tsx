import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { DishType } from '@/schemaValidations/dish.schema'
import type { Table } from '@tanstack/react-table'
import { CirclePlus, LayoutGrid, List, Search, Settings2, UtensilsCrossed, X } from 'lucide-react'
import { DISH_STATUS_OPTIONS } from './dish-columns'

export type ViewMode = 'table' | 'grid'

interface DishTableToolbarProps {
  table: Table<DishType>
  onAddDish: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function DishTableToolbar({
  table,
  onAddDish,
  viewMode,
  onViewModeChange,
}: DishTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  const statusColumn = table.getColumn('status')
  const filterValue = statusColumn?.getFilterValue()
  const statusFilterValue: string[] = Array.isArray(filterValue) ? filterValue : []

  function toggleStatusFilter(value: string) {
    const current = statusFilterValue
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    statusColumn?.setFilterValue(next.length ? next : undefined)
  }

  function resetFilters() {
    table.resetColumnFilters()
    table.setGlobalFilter('')
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      {/* Left: search + filters */}
      <div className='flex flex-1 items-center gap-2'>
        {/* Search */}
        <div className='relative'>
          <Search className='absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            id='dish-search'
            placeholder='Tìm món ăn...'
            value={(table.getState().globalFilter as string) || ''}
            onChange={e => table.setGlobalFilter(e.target.value)}
            className='h-8 w-[200px] pl-8 lg:w-[280px]'
          />
        </div>

        {/* Filter: Trạng thái */}
        <Popover>
          <PopoverTrigger
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'h-8 border-dashed',
            })}
          >
            <CirclePlus className='mr-2 size-4' />
            Trạng thái
            {statusFilterValue.length > 0 && (
              <>
                <Separator orientation='vertical' className='mx-2 h-4' />
                <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
                  {statusFilterValue.length}
                </Badge>
                <div className='hidden space-x-1 lg:flex'>
                  {statusFilterValue.length > 1 ? (
                    <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                      {statusFilterValue.length} đã chọn
                    </Badge>
                  ) : (
                    DISH_STATUS_OPTIONS.filter(o => statusFilterValue.includes(o.value)).map(o => (
                      <Badge
                        key={o.value}
                        variant='secondary'
                        className='rounded-sm px-1 font-normal'
                      >
                        {o.label}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
          </PopoverTrigger>
          <PopoverContent className='w-52 p-2' align='start'>
            <div className='space-y-1'>
              {DISH_STATUS_OPTIONS.map(option => (
                <div
                  key={option.value}
                  className='flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent'
                  onClick={() => toggleStatusFilter(option.value)}
                >
                  <Checkbox
                    checked={statusFilterValue.includes(option.value)}
                    onCheckedChange={() => toggleStatusFilter(option.value)}
                    aria-label={option.label}
                  />
                  <span className='text-sm'>{option.label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset button */}
        {isFiltered && (
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 text-muted-foreground'
            onClick={resetFilters}
          >
            Xóa bộ lọc
            <X className='ml-2 size-4' />
          </Button>
        )}
      </div>

      {/* Right: view toggle + column visibility + add */}
      <div className='flex items-center gap-2'>
        {/* View mode toggle */}
        <div className='flex h-8 items-center rounded-md border bg-muted p-0.5'>
          <Tooltip>
            <TooltipTrigger
              id='dish-view-mode-table'
              className={`inline-flex h-7 w-8 items-center justify-center rounded-sm text-sm font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewModeChange('table')}
            >
              <List className='size-4' />
              <span className='sr-only'>Chế độ bảng</span>
            </TooltipTrigger>
            <TooltipContent>Chế độ bảng</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              id='dish-view-mode-grid'
              className={`inline-flex h-7 w-8 items-center justify-center rounded-sm text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => onViewModeChange('grid')}
            >
              <LayoutGrid className='size-4' />
              <span className='sr-only'>Chế độ lưới</span>
            </TooltipTrigger>
            <TooltipContent>Chế độ lưới</TooltipContent>
          </Tooltip>
        </div>

        {/* Column visibility (only show in table mode) */}
        {viewMode === 'table' && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'ml-auto hidden h-8 lg:flex',
              })}
            >
              <Settings2 className='mr-2 size-4' />
              Hiển thị
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Bật/tắt cột</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(col => col.getCanHide())
                  .map(col => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className='capitalize'
                      checked={col.getIsVisible()}
                      onCheckedChange={value => col.toggleVisibility(!!value)}
                    >
                      {col.id === 'name'
                        ? 'Món ăn'
                        : col.id === 'price'
                          ? 'Giá'
                          : col.id === 'description'
                            ? 'Mô tả'
                            : col.id === 'status'
                              ? 'Trạng thái'
                              : col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Add dish */}
        <Button id='open-create-dish-dialog' size='sm' className='h-8' onClick={onAddDish}>
          <UtensilsCrossed className='mr-2 size-4' />
          Thêm món ăn
        </Button>
      </div>
    </div>
  )
}
