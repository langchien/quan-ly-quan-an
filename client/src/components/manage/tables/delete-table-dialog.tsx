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
import { useDeleteTableMutation } from '@/queries/use-table'
import type { TableSchema } from '@app/shared'
import { toast } from 'sonner'
import type { z } from 'zod'

interface DeleteTableDialogProps {
  table: z.infer<typeof TableSchema> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTableDialog({ table, open, onOpenChange }: DeleteTableDialogProps) {
  const deleteTableMutation = useDeleteTableMutation()

  async function handleDelete() {
    if (!table) return
    try {
      const res = await deleteTableMutation.mutateAsync(table.number)
      toast.success(res.data.message || 'Xóa bàn thành công')
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bàn ăn</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa bàn số{' '}
            <span className='font-semibold text-foreground'>{table?.number}</span>? Hành động này
            không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            disabled={deleteTableMutation.isPending}
          >
            {deleteTableMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
