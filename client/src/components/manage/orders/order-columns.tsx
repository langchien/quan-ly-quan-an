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
import type { OrderSchemaType } from '@/schemaValidations/order.schema'
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

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const ORDER_STATUS_OPTIONS = [
  { value: OrderStatus.Pending, label: '🕐 Chờ xử lý' },
  { value: OrderStatus.Processing, label: '🔄 Đang làm' },
  { value: OrderStatus.Delivered, label: '✅ Đã giao' },
  { value: OrderStatus.Rejected, label: '❌ Từ chối' },
  { value: OrderStatus.Paid, label: '💰 Đã thanh toán' },
]

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case OrderStatus.Pending:
      return (
        <Badge variant='outline' className='gap-1 border-amber-500 text-amber-600'>
          <Clock className='size-3' />
          Chờ xử lý
        </Badge>
      )
    case OrderStatus.Processing:
      return (
        <Badge variant='secondary' className='gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30'>
          <RefreshCcw className='size-3' />
          Đang làm
        </Badge>
      )
    case OrderStatus.Delivered:
      return (
        <Badge className='gap-1 bg-green-600 text-white hover:bg-green-700'>
          <BadgeCheck className='size-3' />
          Đã giao
        </Badge>
      )
    case OrderStatus.Rejected:
      return (
        <Badge variant='destructive' className='gap-1'>
          <Ban className='size-3' />
          Từ chối
        </Badge>
      )
    case OrderStatus.Paid:
      return (
        <Badge className='gap-1 bg-violet-600 text-white hover:bg-violet-700'>
          <CreditCard className='size-3' />
          Đã thanh toán
        </Badge>
      )
    default:
      return <Badge variant='secondary'>{status}</Badge>
  }
}

interface GetOrderColumnsOptions {
  onUpdate: (order: OrderSchemaType) => void
  onPay: (order: OrderSchemaType) => void
}

export function getOrderColumns({
  onUpdate,
  onPay,
}: GetOrderColumnsOptions): ColumnDef<OrderSchemaType>[] {
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
      header: 'Khách',
      cell: ({ row }) => {
        const order = row.original
        const name = order.guest?.name ?? 'Không rõ'
        const table = order.tableNumber ?? order.guest?.tableNumber
        return (
          <div className='flex flex-col'>
            <span className='font-medium'>{name}</span>
            {table !== null && table !== undefined && (
              <span className='text-xs text-muted-foreground'>Bàn {table}</span>
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
          Món ăn
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
      header: 'SL',
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
          Tổng tiền
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
      header: 'Trạng thái',
      cell: ({ row }) => getOrderStatusBadge(row.getValue('status')),
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },

    // Nhân viên xử lý
    {
      id: 'handler',
      accessorFn: row => row.orderHandler?.name ?? '',
      header: 'Nhân viên',
      cell: ({ row }) => {
        const handler = row.original.orderHandler
        if (!handler) {
          return <span className='text-xs text-muted-foreground italic'>Chưa có</span>
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
          Thời gian
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
      header: () => <span className='sr-only'>Thao tác</span>,
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
                <span className='sr-only'>Mở menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    id={`update-order-${order.id}`}
                    onClick={() => onUpdate(order)}
                    disabled={isPaid}
                  >
                    <RefreshCcw className='mr-2 size-4' />
                    Cập nhật
                  </DropdownMenuItem>
                  {!isPaid && order.guest && (
                    <DropdownMenuItem
                      id={`pay-order-${order.id}`}
                      onClick={() => onPay(order)}
                      className='text-violet-600 focus:text-violet-600'
                    >
                      <CheckCheck className='mr-2 size-4' />
                      Thanh toán
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
