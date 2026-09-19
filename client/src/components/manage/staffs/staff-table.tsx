import { CreateStaffDialog } from '@/components/manage/staffs/create-staff-dialog'
import { DeleteStaffDialog } from '@/components/manage/staffs/delete-staff-dialog'
import { EditStaffDialog } from '@/components/manage/staffs/edit-staff-dialog'
import { getStaffColumns } from '@/components/manage/staffs/staff-columns'
import { StaffDataTable } from '@/components/manage/staffs/staff-data-table'
import { useGetAccountList } from '@/queries/use-account'
import type { AccountType } from '@/schemaValidations/account.schema'
import { UserX } from 'lucide-react'
import { useMemo, useState } from 'react'

export function StaffTable() {
  const { data: staffList, isLoading, isError } = useGetAccountList()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AccountType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AccountType | null>(null)

  const columns = useMemo(
    () =>
      getStaffColumns({
        onEdit: staff => setEditTarget(staff),
        onDelete: staff => setDeleteTarget(staff),
      }),
    []
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <UserX className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>Không thể tải danh sách nhân viên</p>
          <p className='text-sm text-muted-foreground'>Vui lòng thử lại sau</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <StaffDataTable
        columns={columns}
        data={staffList ?? []}
        isLoading={isLoading}
        onAddStaff={() => setCreateOpen(true)}
      />

      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditStaffDialog
        staff={editTarget}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
      />

      <DeleteStaffDialog
        staff={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      />
    </>
  )
}
