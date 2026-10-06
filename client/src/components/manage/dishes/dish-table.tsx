import { CreateDishDialog } from '@/components/manage/dishes/create-dish-dialog'
import { DeleteDishDialog } from '@/components/manage/dishes/delete-dish-dialog'
import { EditDishDialog } from '@/components/manage/dishes/edit-dish-dialog'
import { getDishColumns } from '@/components/manage/dishes/dish-columns'
import { DishDataTable } from '@/components/manage/dishes/dish-data-table'
import { useRole } from '@/hooks/useRole'
import { useSocketEvent } from '@/hooks/use-socket-event'
import { useGetDishList } from '@/queries/use-dish'
import { DishStatus, type DishType } from '@app/shared'
import { useQueryClient } from '@tanstack/react-query'
import { UtensilsCrossed } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function DishTable() {
  const { t } = useTranslation(['manage', 'common'])
  const queryClient = useQueryClient()
  const { data: dishList, isLoading, isError } = useGetDishList()
  const { isOwner } = useRole()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DishType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DishType | null>(null)

  // Đồng bộ realtime khi bất kỳ ai đổi trạng thái món ăn
  useSocketEvent('dish-status-changed', payload => {
    queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })

    if (payload.status === DishStatus.Available) {
      toast.success(t('dishes.toastAvailable', { name: payload.name }))
    } else if (payload.status === DishStatus.Unavailable) {
      toast.warning(t('dishes.toastUnavailable', { name: payload.name }))
    } else if (payload.status === DishStatus.Hidden) {
      toast.info(t('dishes.toastHidden', { name: payload.name }))
    }
  })

  const columns = useMemo(
    () =>
      getDishColumns({
        t,
        onEdit: dish => setEditTarget(dish),
        onDelete: isOwner ? dish => setDeleteTarget(dish) : undefined,
      }),
    [isOwner, t]
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <UtensilsCrossed className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>{t('dishes.loadError')}</p>
          <p className='text-sm text-muted-foreground'>{t('dishes.tryAgainLater')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DishDataTable
        columns={columns}
        data={dishList ?? []}
        isLoading={isLoading}
        onAddDish={() => setCreateOpen(true)}
        onEdit={dish => setEditTarget(dish)}
        onDelete={isOwner ? dish => setDeleteTarget(dish) : undefined}
      />

      <CreateDishDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditDishDialog
        dish={editTarget}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
      />

      {isOwner && (
        <DeleteDishDialog
          dish={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
        />
      )}
    </>
  )
}
