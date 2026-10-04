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

export function DishTable() {
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
      toast.success(`Món "${payload.name}" đã mở bán trở lại`)
    } else if (payload.status === DishStatus.Unavailable) {
      toast.warning(`Món "${payload.name}" đã chuyển sang Tạm hết`)
    } else if (payload.status === DishStatus.Hidden) {
      toast.info(`Món "${payload.name}" đã được ẩn`)
    }
  })

  const columns = useMemo(
    () =>
      getDishColumns({
        onEdit: dish => setEditTarget(dish),
        onDelete: isOwner ? dish => setDeleteTarget(dish) : undefined,
      }),
    [isOwner]
  )

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <UtensilsCrossed className='size-12 text-muted-foreground/50' />
        <div>
          <p className='font-medium text-destructive'>Không thể tải danh sách món ăn</p>
          <p className='text-sm text-muted-foreground'>Vui lòng thử lại sau</p>
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
