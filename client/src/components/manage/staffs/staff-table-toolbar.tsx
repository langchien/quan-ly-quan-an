import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { AccountType } from '@/schemaValidations/account.schema'
import type { Table } from '@tanstack/react-table'
import { CirclePlus, Search, Settings2, UserPlus, X } from 'lucide-react'
import { ROLE_OPTIONS } from './staff-columns'

interface StaffTableToolbarProps {
  table: Table<AccountType>
  onAddStaff: () => void
}

export function StaffTableToolbar({ table, onAddStaff }: StaffTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  const roleColumn = table.getColumn('role')
  const filterValue = roleColumn?.getFilterValue()
  const roleFilterValue: string[] = Array.isArray(filterValue) ? filterValue : []

  function toggleRoleFilter(value: string) {
    const current = roleFilterValue
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    roleColumn?.setFilterValue(next.length ? next : undefined)
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
            id='staff-search'
            placeholder='Tìm nhân viên...'
            value={(table.getState().globalFilter as string) || ''}
            onChange={e => table.setGlobalFilter(e.target.value)}
            className='h-8 w-[200px] pl-8 lg:w-[280px]'
          />
        </div>

        {/* Filter: Vai trò */}
        <Popover>
          <PopoverTrigger
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'h-8 border-dashed',
            })}
          >
            <CirclePlus className='mr-2 size-4' />
            Vai trò
            {roleFilterValue.length > 0 && (
              <>
                <Separator orientation='vertical' className='mx-2 h-4' />
                <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
                  {roleFilterValue.length}
                </Badge>
                <div className='hidden space-x-1 lg:flex'>
                  {roleFilterValue.length > 1 ? (
                    <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                      {roleFilterValue.length} đã chọn
                    </Badge>
                  ) : (
                    ROLE_OPTIONS.filter(o => roleFilterValue.includes(o.value)).map(o => (
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
          <PopoverContent className='w-48 p-2' align='start'>
            <div className='space-y-1'>
              {ROLE_OPTIONS.map(option => (
                <div
                  key={option.value}
                  className='flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent'
                  onClick={() => toggleRoleFilter(option.value)}
                >
                  <Checkbox
                    checked={roleFilterValue.includes(option.value)}
                    onCheckedChange={() => toggleRoleFilter(option.value)}
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

      {/* Right: view + add */}
      <div className='flex items-center gap-2'>
        {/* Column visibility */}
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
          <DropdownMenuContent align='end' className='w-40'>
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
                    ? 'Nhân viên'
                    : col.id === 'email'
                      ? 'Email'
                      : col.id === 'role'
                        ? 'Vai trò'
                        : col.id === 'createdAt'
                          ? 'Ngày tạo'
                          : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add staff */}
        <Button id='open-create-staff-dialog' size='sm' className='h-8' onClick={onAddStaff}>
          <UserPlus className='mr-2 size-4' />
          Thêm nhân viên
        </Button>
      </div>
    </div>
  )
}
