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

function getRoleBadge(role: string) {
  const emoji = ROLE_EMOJI[role] ?? ''
  const label = getRoleLabel(role)
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
}

export function getStaffColumns({
  onEdit,
  onDelete,
}: GetStaffColumnsOptions): ColumnDef<AccountType>[] {
  return [
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
          Nhân viên
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
          Email
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => <span className='text-muted-foreground'>{row.getValue('email')}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Vai trò',
      cell: ({ row }) => getRoleBadge(row.getValue('role')),
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
          Ngày tạo
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
      header: () => <span className='sr-only'>Thao tác</span>,
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
                <span className='sr-only'>Mở menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem id={`edit-staff-${staff.id}`} onClick={() => onEdit(staff)}>
                    <Pencil className='mr-2 size-4' />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    id={`delete-staff-${staff.id}`}
                    onClick={() => onDelete(staff)}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='mr-2 size-4' />
                    Xóa
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
