import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderStatus } from '@app/shared'
import { formatCurrency } from '@/lib/format'
import type { OrderSchemaType } from '@app/shared'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  BadgeCheck,
  Ban,
  CheckCheck,
  Clock,
  CreditCard,
  MoreHorizontal,
  RefreshCcw,
} from 'lucide-react'
import { formatDateTime } from '@/lib/i18n/use-locale'
import { getOrderStatusLabel, getOrderStatusOptions } from '@/lib/status-label'

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export { formatDateTime }

export const ORDER_STATUS_OPTIONS = getOrderStatusOptions()

export function getOrderStatusBadge(status: string, getLabel?: (s: string) => string) {
  const label = getLabel ? getLabel(status) : getOrderStatusLabel(status)
  switch (status) {
    case OrderStatus.Pending:
      return (
        <Badge variant='outline' className='gap-1 border-amber-500 text-amber-600'>
          <Clock className='size-3' />
          {label}
        </Badge>
      )
    case OrderStatus.Processing:
      return (
        <Badge variant='secondary' className='gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30'>
          <RefreshCcw className='size-3' />
          {label}
        </Badge>
      )
    case OrderStatus.Delivered:
      return (
        <Badge className='gap-1 bg-green-600 text-white hover:bg-green-700'>
          <BadgeCheck className='size-3' />
          {label}
        </Badge>
      )
    case OrderStatus.Rejected:
      return (
        <Badge variant='destructive' className='gap-1'>
          <Ban className='size-3' />
          {label}
        </Badge>
      )
    case OrderStatus.Paid:
      return (
        <Badge className='gap-1 bg-violet-600 text-white hover:bg-violet-700'>
          <CreditCard className='size-3' />
          {label}
        </Badge>
      )
    default:
      return <Badge variant='secondary'>{status}</Badge>
  }
}

interface GetOrderColumnsOptions {
  onUpdate: (order: OrderSchemaType) => void
  onPay: (order: OrderSchemaType) => void
  t?: (key: any, opts?: any) => string
  getStatusLabel?: (status: string) => string
}

export function getOrderColumns({
  onUpdate,
  onPay,
  t,
  getStatusLabel,
}: GetOrderColumnsOptions): ColumnDef<OrderSchemaType>[] {
  const guestHeader = t ? t('orders.columns.guest') : 'Khách'
  const dishHeader = t ? t('orders.columns.dish') : 'Món ăn'
  const qtyHeader = t ? t('orders.columns.quantityShort') : 'SL'
  const totalHeader = t ? t('orders.columns.total') : 'Tổng tiền'
  const statusHeader = t ? t('orders.columns.status') : 'Trạng thái'
  const handlerHeader = t ? t('orders.columns.handler', { defaultValue: 'Nhân viên' }) : 'Nhân viên'
  const timeHeader = t ? t('orders.columns.time') : 'Thời gian'
  const actionsHeader = t ? t('orders.columns.actions') : 'Thao tác'
  const unknownGuest = t ? t('orders.columns.unknownGuest') : 'Không rõ'
  return [
    // ID
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          #
          <ArrowUpDown className='ml-1.5 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground tabular-nums'>#{row.getValue('id')}</span>
      ),
      enableHiding: false,
    },

    // Khách
    {
      id: 'guest',
      accessorFn: row => row.guest?.name ?? '',
      header: guestHeader,
      cell: ({ row }) => {
        const order = row.original
        const name = order.guest?.name ?? unknownGuest
        const table = order.tableNumber ?? order.guest?.tableNumber
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{name}</span>
            {table !== null && table !== undefined && (
              <span className='text-xs text-muted-foreground'>
                {t ? t('common:table.tableNumber', { number: table, defaultValue: `Bàn ${table}` }) : `Bàn ${table}`}
              </span>
            )}
          </div>
        )
      },
    },

    // Món ăn
    {
      id: 'dish',
      accessorFn: row => row.dishSnapshot.name,
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {dishHeader}
          <ArrowUpDown className='ml-1.5 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => {
        const snap = row.original.dishSnapshot
        return (
          <div className='flex items-center gap-2.5'>
            <Avatar className='size-9 rounded-lg'>
              <AvatarImage src={snap.image} alt={snap.name} className='object-cover' />
              <AvatarFallback className='rounded-lg bg-primary/10 text-xs font-semibold text-primary'>
                {getInitials(snap.name)}
              </AvatarFallback>
            </Avatar>
            <span className='font-medium'>{snap.name}</span>
          </div>
        )
      },
    },

    // Số lượng
    {
      accessorKey: 'quantity',
      header: qtyHeader,
      cell: ({ row }) => (
        <span className='font-medium tabular-nums'>{row.getValue('quantity')}</span>
      ),
    },

    // Tổng tiền
    {
      id: 'total',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {totalHeader}
          <ArrowUpDown className='ml-1.5 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      accessorFn: row => row.dishSnapshot.price * row.quantity,
      cell: ({ row }) => {
        const total = row.original.dishSnapshot.price * row.original.quantity
        return <span className='font-medium tabular-nums'>{formatCurrency(total)}</span>
      },
    },

    // Trạng thái
    {
      accessorKey: 'status',
      header: statusHeader,
      cell: ({ row }) => getOrderStatusBadge(row.getValue('status'), getStatusLabel),
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },

    // Nhân viên xử lý
    {
      id: 'handler',
      accessorFn: row => row.orderHandler?.name ?? '',
      header: handlerHeader,
      cell: ({ row }) => {
        const handler = row.original.orderHandler
        if (!handler) {
          return (
            <span className='text-xs text-muted-foreground italic'>
              {t ? t('orders.columns.noHandler', { defaultValue: 'Chưa có' }) : 'Chưa có'}
            </span>
          )
        }
        return (
          <div className='flex items-center gap-2'>
            <Avatar className='size-7'>
              <AvatarImage src={handler.avatar ?? ''} alt={handler.name} className='object-cover' />
              <AvatarFallback className='bg-primary/10 text-xs text-primary'>
                {getInitials(handler.name)}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm'>{handler.name}</span>
          </div>
        )
      },
    },

    // Thời gian
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {timeHeader}
          <ArrowUpDown className='ml-1.5 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground tabular-nums'>
          {formatDateTime(row.getValue('createdAt'))}
        </span>
      ),
    },

    // Actions
    {
      id: 'actions',
      header: () => <span className='sr-only'>{actionsHeader}</span>,
      cell: ({ row }) => {
        const order = row.original
        const isPaid = order.status === OrderStatus.Paid
        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger
                id={`order-actions-${order.id}`}
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon-sm',
                  className: 'data-[state=open]:bg-muted',
                })}
              >
                <MoreHorizontal className='size-4' />
                <span className='sr-only'>{t ? t('common:actions.openMenu') : 'Mở menu'}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{actionsHeader}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    id={`update-order-${order.id}`}
                    onClick={() => onUpdate(order)}
                    disabled={isPaid}
                  >
                    <RefreshCcw className='mr-2 size-4' />
                    {t ? t('common:actions.update') : 'Cập nhật'}
                  </DropdownMenuItem>
                  {!isPaid && order.guest && (
                    <DropdownMenuItem
                      id={`pay-order-${order.id}`}
                      onClick={() => onPay(order)}
                      className='text-violet-600 focus:text-violet-600'
                    >
                      <CheckCheck className='mr-2 size-4' />
                      {t ? t('orders.payDialog.title') : 'Thanh toán'}
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
