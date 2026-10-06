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
import type { TableSchema } from '@app/shared'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Link, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import type { z } from 'zod'

import { formatDate } from '@/lib/i18n/use-locale'
import { getTableStatusLabel, TABLE_STATUS_EMOJI } from '@/lib/status-label'
import i18n from '@/lib/i18n'

export { formatDate }

function getStatusBadge(status: string) {
  const emoji = TABLE_STATUS_EMOJI[status] ?? ''
  const label = getTableStatusLabel(status)
  switch (status) {
    case 'Available':
      return (
        <Badge variant='default'>
          {emoji} {label}
        </Badge>
      )
    case 'Reserved':
      return (
        <Badge variant='secondary'>
          {emoji} {label}
        </Badge>
      )
    case 'Hidden':
      return (
        <Badge variant='outline'>
          {emoji} {label}
        </Badge>
      )
    default:
      return <Badge variant='secondary'>{status}</Badge>
  }
}

interface GetTableColumnsOptions {
  t?: (key: any, opts?: any) => string
  onEdit: (table: z.infer<typeof TableSchema>) => void
  onDelete?: (table: z.infer<typeof TableSchema>) => void
}

export function getTableColumns({
  t = i18n.t,
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
          aria-label={t('common:table.selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label={t('common:table.selectRow')}
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
          {t('tables.columns.number')}
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
          {t('tables.columns.capacity')}
          <ArrowUpDown className='ml-2 size-3.5 text-muted-foreground/70' />
        </Button>
      ),
      cell: ({ row }) => <span className='text-muted-foreground'>{row.getValue('capacity')}</span>,
    },
    {
      accessorKey: 'status',
      header: t('tables.columns.status'),
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'token',
      header: t('tables.columns.qrCode'),
      cell: ({ row }) => {
        const table = row.original
        const url = `${envConfig.VITE_WEB_URL}/guest/tables/${table.number}?token=${table.token}`
        return (
          <div className='flex items-center justify-center p-2'>
            <div className='inline-block rounded-md border bg-white p-1'>
              <QRCodeCanvas value={url} size={80} />
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
          {t('tables.columns.createdAt')}
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
      header: () => <span className='sr-only'>{t('tables.columns.actions')}</span>,
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
                <span className='sr-only'>{t('common:actions.openMenu')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t('tables.columns.actions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    id={`copy-table-link-${table.number}`}
                    onClick={() => {
                      const url = `${envConfig.VITE_WEB_URL}/guest/tables/${table.number}?token=${table.token}`
                      navigator.clipboard.writeText(url)
                      toast.success(t('tables.linkCopied'))
                    }}
                  >
                    <Link className='mr-2 size-4' />
                    {t('tables.qrModal.copyLink')}
                  </DropdownMenuItem>
                  <DropdownMenuItem id={`edit-table-${table.number}`} onClick={() => onEdit(table)}>
                    <Pencil className='mr-2 size-4' />
                    {t('common:actions.edit')}
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem
                      id={`delete-table-${table.number}`}
                      onClick={() => onDelete(table)}
                      className='text-destructive focus:text-destructive'
                    >
                      <Trash2 className='mr-2 size-4' />
                      {t('common:actions.delete')}
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
