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

      {/* Table */}
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
                        ? 'Không tìm thấy kết quả phù hợp'
                        : 'Chưa có đơn hàng nào'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: row count + pagination */}
      {(pageCount > 1 || totalFiltered > 0) && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{totalFiltered > 0 ? `${from}–${to} / ${totalFiltered} đơn hàng` : ''}</span>

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
