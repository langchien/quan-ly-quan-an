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
import type { AccountType } from '@app/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/i18n/use-locale'
import { getRoleLabel, getRoleOptions, ROLE_EMOJI } from '@/lib/status-label'

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export { formatDate }

export const ROLE_OPTIONS = getRoleOptions()

export function getRoleBadge(role: string, getLabel?: (role: string) => string) {
  const emoji = ROLE_EMOJI[role] ?? ''
  const label = getLabel ? getLabel(role) : getRoleLabel(role)
  switch (role) {
    case 'Owner':
      return (
        <Badge variant='default'>
          {emoji} {label}
        </Badge>
      )
    case 'Employee':
      return (
        <Badge variant='outline'>
          {emoji} {label}
        </Badge>
      )
    default:
      return <Badge variant='secondary'>{role}</Badge>
  }
}

interface GetStaffColumnsOptions {
  onEdit: (staff: AccountType) => void
  onDelete: (staff: AccountType) => void
  t?: (key: any, opts?: any) => string
  getRoleLabel?: (role: string) => string
}

export function getStaffColumns({
  onEdit,
  onDelete,
  t,
  getRoleLabel: customRoleLabel,
}: GetStaffColumnsOptions): ColumnDef<AccountType>[] {
  const selectAll = t ? t('common:table.selectAll') : 'Chọn tất cả'
  const selectRow = t ? t('common:table.selectRow') : 'Chọn dòng'
  const nameHeader = t ? t('staffs.columns.name') : 'Nhân viên'
  const emailHeader = t ? t('staffs.columns.email') : 'Email'
  const roleHeader = t ? t('staffs.columns.role') : 'Vai trò'
  const createdAtHeader = t ? t('staffs.columns.createdAt') : 'Ngày tạo'
  const actionsHeader = t ? t('staffs.columns.actions') : 'Thao tác'
  const openMenu = t ? t('common:actions.openMenu') : 'Mở menu'
  const editLabel = t ? t('common:actions.edit') : 'Chỉnh sửa'
  const deleteLabel = t ? t('common:actions.delete') : 'Xóa'
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label={selectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label={selectRow}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
          {nameHeader}
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => {
        const staff = row.original
        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-8'>
              <AvatarImage src={staff.avatar ?? undefined} alt={staff.name} />
              <AvatarFallback className='bg-primary/10 text-xs font-semibold text-primary'>
                {getInitials(staff.name)}
              </AvatarFallback>
            </Avatar>
            <span className='font-medium'>{staff.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {emailHeader}
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => <span className='text-muted-foreground'>{row.getValue('email')}</span>,
    },
    {
      accessorKey: 'role',
      header: roleHeader,
      cell: ({ row }) => getRoleBadge(row.getValue('role'), customRoleLabel),
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {createdAtHeader}
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {formatDate(row.getValue('createdAt'))}
        </span>
      ),
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>{actionsHeader}</span>,
      cell: ({ row }) => {
        const staff = row.original
        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger
                id={`staff-actions-${staff.id}`}
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon-sm',
                  className: 'data-[state=open]:bg-muted',
                })}
              >
                <MoreHorizontal className='size-4' />
                <span className='sr-only'>{openMenu}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{actionsHeader}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem id={`edit-staff-${staff.id}`} onClick={() => onEdit(staff)}>
                    <Pencil className='mr-2 size-4' />
                    {editLabel}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    id={`delete-staff-${staff.id}`}
                    onClick={() => onDelete(staff)}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='mr-2 size-4' />
                    {deleteLabel}
                  </DropdownMenuItem>
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

