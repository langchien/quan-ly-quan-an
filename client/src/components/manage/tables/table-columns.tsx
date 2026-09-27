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
import { envConfig } from '@/envConfig'
import type { TableSchema } from '@/schemaValidations/table.schema'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Link, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import type { z } from 'zod'

export function formatDate(dateStr: string | Date | undefined | null) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Available':
      return <Badge variant='default'>🟢 Trống</Badge>
    case 'Reserved':
      return <Badge variant='secondary'>🟡 Đã đặt</Badge>
    case 'Hidden':
      return <Badge variant='outline'>🔴 Ẩn</Badge>
    default:
      return <Badge variant='secondary'>{status}</Badge>
  }
}

interface GetTableColumnsOptions {
  onEdit: (table: z.infer<typeof TableSchema>) => void
  onDelete?: (table: z.infer<typeof TableSchema>) => void
}

export function getTableColumns({
  onEdit,
  onDelete,
}: GetTableColumnsOptions): ColumnDef<z.infer<typeof TableSchema>>[] {
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
      accessorKey: 'number',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Số bàn
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => <span className='font-medium'>{row.getValue('number')}</span>,
    },
    {
      accessorKey: 'capacity',
      header: ({ column }) => (
        <Button
          variant='ghost'
          size='sm'
          className='-ml-3 h-8 font-medium'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sức chứa
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => <span className='text-muted-foreground'>{row.getValue('capacity')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'token',
      header: 'QR Code',
      cell: ({ row }) => {
        const table = row.original
        const url = `${envConfig.VITE_WEB_URL}/guest/tables/${table.number}?token=${table.token}`
        return (
          <div className='flex items-center justify-center p-2'>
            <div className='inline-block rounded-md border bg-white p-1'>
              <QRCodeCanvas value={url} size={80} includeMargin={false} />
            </div>
          </div>
        )
      },
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
        const table = row.original
        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger
                id={`table-actions-${table.number}`}
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
                  <DropdownMenuItem
                    id={`copy-table-link-${table.number}`}
                    onClick={() => {
                      const url = `${envConfig.VITE_WEB_URL}/guest/tables/${table.number}?token=${table.token}`
                      navigator.clipboard.writeText(url)
                      toast.success('Đã sao chép đường dẫn bàn ăn')
                    }}
                  >
                    <Link className='mr-2 size-4' />
                    Sao chép URL
                  </DropdownMenuItem>
                  <DropdownMenuItem id={`edit-table-${table.number}`} onClick={() => onEdit(table)}>
                    <Pencil className='mr-2 size-4' />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem
                      id={`delete-table-${table.number}`}
                      onClick={() => onDelete(table)}
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
