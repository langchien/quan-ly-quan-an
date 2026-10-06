import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useDeleteEmployeeAccountMutation } from '@/queries/use-account'
import type { AccountType } from '@app/shared'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface DeleteStaffDialogProps {
  staff: AccountType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteStaffDialog({ staff, open, onOpenChange }: DeleteStaffDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const deleteStaffMutation = useDeleteEmployeeAccountMutation()

  async function handleDelete() {
    if (!staff) return
    try {
      const res = await deleteStaffMutation.mutateAsync(staff.id)
      toast.success(res.data.message || t('staffs.deleteDialog.success'))
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('staffs.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('staffs.deleteDialog.description', {
              name: staff?.name,
              defaultValue: `Bạn có chắc chắn muốn xóa nhân viên "${staff?.name}"? Hành động này không thể hoàn tác.`,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            disabled={deleteStaffMutation.isPending}
          >
            {deleteStaffMutation.isPending
              ? t('staffs.deleteDialog.deleting')
              : t('common:actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
