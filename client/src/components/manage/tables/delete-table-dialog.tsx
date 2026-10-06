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
import { useTranslation } from 'react-i18next'

interface DeleteTableDialogProps {
  table: z.infer<typeof TableSchema> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTableDialog({ table, open, onOpenChange }: DeleteTableDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const deleteTableMutation = useDeleteTableMutation()

  async function handleDelete() {
    if (!table) return
    try {
      const res = await deleteTableMutation.mutateAsync(table.number)
      toast.success(res.data.message || t('tables.deleteDialog.success'))
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('tables.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('tables.deleteDialog.description', {
              number: table?.number,
              defaultValue: `Bạn có chắc chắn muốn xóa bàn số ${table?.number}? Hành động này không thể hoàn tác.`,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            disabled={deleteTableMutation.isPending}
          >
            {deleteTableMutation.isPending
              ? t('tables.deleteDialog.deleting')
              : t('common:actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

