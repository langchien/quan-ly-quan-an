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
import { useDeleteDishMutation } from '@/queries/use-dish'
import type { DishType } from '@app/shared'
import { toast } from 'sonner'

import { useTranslation } from 'react-i18next'

interface DeleteDishDialogProps {
  dish: DishType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDishDialog({ dish, open, onOpenChange }: DeleteDishDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const deleteDishMutation = useDeleteDishMutation()

  async function handleDelete() {
    if (!dish) return
    try {
      const res = await deleteDishMutation.mutateAsync(dish.id)
      toast.success(res.data.message || t('dishes.deleteDialog.success'))
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dishes.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dishes.deleteDialog.description', { name: dish?.name ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            disabled={deleteDishMutation.isPending}
          >
            {deleteDishMutation.isPending
              ? t('dishes.deleteDialog.deleting')
              : t('dishes.deleteDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
