import { DataTablePagination } from '@/components/ui/data-table-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OrderSchemaType } from '@app/shared'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslation } from 'react-i18next'
import { OrderTableToolbar } from './order-table-toolbar'

const PAGE_SIZE = 10

interface OrderDataTableProps {
  columns: ColumnDef<OrderSchemaType>[]
  data: OrderSchemaType[]
  isLoading?: boolean
  onAddOrder: () => void
}

function LoadingSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: colCount }).map((_col, j) => (
            <TableCell key={j}>
              <Skeleton className='h-5 w-full' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function OrderDataTable({ columns, data, isLoading, onAddOrder }: OrderDataTableProps) {
  const { t } = useTranslation(['manage', 'common'])
  const isMobile = useIsMobile()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase()
      const guestName = String(row.getValue('guest') ?? '').toLowerCase()
      const dishName = String(row.getValue('dish') ?? '').toLowerCase()
      return guestName.includes(q) || dishName.includes(q)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered)

  return (
    <div className='space-y-4'>
      <OrderTableToolbar table={table} onAddOrder={onAddOrder} />

      {isMobile ? (
        /* Mobile: card list — dùng chung row model nên sort/filter/phân trang không đổi */
        <div className='space-y-3' id='order-card-list'>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-28 w-full rounded-xl' />
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => {
              const cell = (id: string) => row.getAllCells().find(c => c.column.id === id)
              const render = (id: string) => {
                const c = cell(id)
                return c ? flexRender(c.column.columnDef.cell, c.getContext()) : null
              }
              return (
                <div key={row.id} className='space-y-3 rounded-xl border bg-card p-3 shadow-sm'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>{render('guest')}</div>
                    <div className='flex shrink-0 items-center gap-1'>
                      {render('status')}
                      {render('actions')}
                    </div>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='min-w-0 flex-1'>{render('dish')}</div>
                    <span className='shrink-0 text-sm text-muted-foreground'>
                      × {render('quantity')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between border-t pt-2'>
                    {render('createdAt')}
                    {render('total')}
                  </div>
                </div>
              )
            })
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center'>
              <ClipboardList className='size-10 text-muted-foreground/40' />
              <p className='text-sm text-muted-foreground'>
                {globalFilter || columnFilters.length
                  ? t('common:table.noResults')
                  : t('orders.empty', { defaultValue: 'Chưa có đơn hàng nào' })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LoadingSkeleton colCount={columns.length} />
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
                      <ClipboardList className='size-10 text-muted-foreground/40' />
                      <p className='text-sm text-muted-foreground'>
                        {globalFilter || columnFilters.length
                          ? t('common:table.noResults')
                          : t('orders.empty', { defaultValue: 'Chưa có đơn hàng nào' })}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer: row count + pagination */}
      {(pageCount > 1 || totalFiltered > 0) && (
        <div className='flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-between'>
          <span>
            {totalFiltered > 0
              ? t('orders.summary', {
                  from,
                  to,
                  total: totalFiltered,
                  defaultValue: `${from}–${to} / ${totalFiltered} đơn hàng`,
                })
              : ''}
          </span>

          {pageCount > 1 && (
            <DataTablePagination
              pageIndex={pageIndex}
              pageCount={pageCount}
              canPreviousPage={table.getCanPreviousPage()}
              canNextPage={table.getCanNextPage()}
              onPageChange={table.setPageIndex}
              onPreviousPage={() => table.previousPage()}
              onNextPage={() => table.nextPage()}
            />
          )}
        </div>
      )}
    </div>
  )
}
