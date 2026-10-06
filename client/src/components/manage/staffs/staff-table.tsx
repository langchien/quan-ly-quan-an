import { CreateStaffDialog } from '@/components/manage/staffs/create-staff-dialog'
import { DeleteStaffDialog } from '@/components/manage/staffs/delete-staff-dialog'
import { EditStaffDialog } from '@/components/manage/staffs/edit-staff-dialog'
import { getStaffColumns } from '@/components/manage/staffs/staff-columns'
import { StaffDataTable } from '@/components/manage/staffs/staff-data-table'
import { useGetAccountList } from '@/queries/use-account'
import type { AccountType } from '@app/shared'
import { UserX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStatusLabel } from '@/lib/status-label'

export function StaffTable() {
  const { t } = useTranslation(['manage', 'common'])
  const { getRoleLabel } = useStatusLabel()
  const { data: staffList, isLoading, isError } = useGetAccountList()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AccountType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AccountType | null>(null)

  const columns = useMemo(
    () =>
      getStaffColumns({
        onEdit: staff => setEditTarget(staff),
        onDelete: staff => setDeleteTarget(staff),
        t,
        getRoleLabel,
      }),
    [t, getRoleLabel]
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <UserX className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>
            {t('staffs.loadError', { defaultValue: 'Không thể tải danh sách nhân viên' })}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('staffs.tryAgainLater', { defaultValue: 'Vui lòng thử lại sau' })}
          </p>
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
        onEdit={staff => setEditTarget(staff)}
        onDelete={staff => setDeleteTarget(staff)}
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
