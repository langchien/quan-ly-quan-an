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
import type { AccountType } from '@/schemaValidations/account.schema'
import { toast } from 'sonner'

interface DeleteStaffDialogProps {
  staff: AccountType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteStaffDialog({ staff, open, onOpenChange }: DeleteStaffDialogProps) {
  const deleteStaffMutation = useDeleteEmployeeAccountMutation()

  async function handleDelete() {
    if (!staff) return
    try {
      const res = await deleteStaffMutation.mutateAsync(staff.id)
      toast.success(res.data.message || 'Xóa nhân viên thành công')
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nhân viên</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nhân viên{' '}
            <span className='font-semibold text-foreground'>{staff?.name}</span>? Hành động này
            không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            disabled={deleteStaffMutation.isPending}
          >
            {deleteStaffMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
