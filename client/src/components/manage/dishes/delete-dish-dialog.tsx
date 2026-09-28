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

interface DeleteDishDialogProps {
  dish: DishType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDishDialog({ dish, open, onOpenChange }: DeleteDishDialogProps) {
  const deleteDishMutation = useDeleteDishMutation()

  async function handleDelete() {
    if (!dish) return
    try {
      const res = await deleteDishMutation.mutateAsync(dish.id)
      toast.success(res.data.message || 'Xóa món ăn thành công')
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa món{' '}
            <span className='font-semibold text-foreground'>{dish?.name}</span>? Hành động này không
            thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            disabled={deleteDishMutation.isPending}
          >
            {deleteDishMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
