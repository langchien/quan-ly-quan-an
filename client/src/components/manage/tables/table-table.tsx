import { CreateTableDialog } from '@/components/manage/tables/create-table-dialog'
import { DeleteTableDialog } from '@/components/manage/tables/delete-table-dialog'
import { EditTableDialog } from '@/components/manage/tables/edit-table-dialog'
import { getTableColumns } from '@/components/manage/tables/table-columns'
import { TableDataTable } from '@/components/manage/tables/table-data-table'
import { useGetTableList } from '@/queries/use-table'
import type { TableSchema } from '@/schemaValidations/table.schema'
import { LayoutGrid } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { z } from 'zod'

export function TableTable() {
  const { data: tableList, isLoading, isError } = useGetTableList()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<z.infer<typeof TableSchema> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<z.infer<typeof TableSchema> | null>(null)

  const columns = useMemo(
    () =>
      getTableColumns({
        onEdit: table => setEditTarget(table),
        onDelete: table => setDeleteTarget(table),
      }),
    []
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <LayoutGrid className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>Không thể tải danh sách bàn ăn</p>
          <p className='text-sm text-muted-foreground'>Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <TableDataTable
        columns={columns}
        data={tableList ?? []}
        isLoading={isLoading}
        onAddTable={() => setCreateOpen(true)}
      />

      <CreateTableDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditTableDialog
        table={editTarget}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
      />

      <DeleteTableDialog
        table={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      />
    </>
  )
}
