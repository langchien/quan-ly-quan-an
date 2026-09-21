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
import type { DishType } from '@/schemaValidations/dish.schema'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { DishGridView } from './dish-grid-view'
import { DishTableToolbar, type ViewMode } from './dish-table-toolbar'

const PAGE_SIZE = 10

interface DishDataTableProps {
  columns: ColumnDef<DishType>[]
  data: DishType[]
  isLoading?: boolean
  onAddDish: () => void
  onEdit: (dish: DishType) => void
  onDelete: (dish: DishType) => void
}

function LoadingSkeleton({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
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

export function DishDataTable({
  columns,
  data,
  isLoading,
  onAddDish,
  onEdit,
  onDelete,
}: DishDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const q = filterValue.toLowerCase()
      const name = String(row.getValue('name') ?? '')
      const description = String(row.getValue('description') ?? '')
      return name.toLowerCase().includes(q) || description.toLowerCase().includes(q)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered)

  // Extract status filter for grid view
  const statusColumn = table.getColumn('status')
  const statusFilterRaw = statusColumn?.getFilterValue()
  const statusFilter: string[] = Array.isArray(statusFilterRaw) ? statusFilterRaw : []

  return (
    <div className='space-y-4'>
      <DishTableToolbar
        table={table}
        onAddDish={onAddDish}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'table' ? (
        <>
          {/* Table view */}
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                    >
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
                        <UtensilsCrossed className='size-10 text-muted-foreground/40' />
                        <p className='text-sm text-muted-foreground'>
                          {globalFilter || columnFilters.length
                            ? 'Không tìm thấy kết quả phù hợp'
                            : 'Chưa có món ăn nào'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer: selection info + pagination */}
          {(pageCount > 1 || table.getFilteredSelectedRowModel().rows.length > 0) && (
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              {/* Selection info */}
              <span>
                {table.getFilteredSelectedRowModel().rows.length > 0
                  ? `${table.getFilteredSelectedRowModel().rows.length} / ${totalFiltered} dòng được chọn`
                  : totalFiltered > 0
                    ? `${from}–${to} / ${totalFiltered} món ăn`
                    : ''}
              </span>

              {/* Pagination */}
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
        </>
      ) : (
        /* Grid view */
        <DishGridView
          data={data}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          globalFilter={globalFilter}
          statusFilter={statusFilter}
        />
      )}
    </div>
  )
}
