import { CreateDishDialog } from '@/components/manage/dishes/create-dish-dialog'
import { DeleteDishDialog } from '@/components/manage/dishes/delete-dish-dialog'
import { EditDishDialog } from '@/components/manage/dishes/edit-dish-dialog'
import { getDishColumns } from '@/components/manage/dishes/dish-columns'
import { DishDataTable } from '@/components/manage/dishes/dish-data-table'
import { useGetDishList } from '@/queries/use-dish'
import type { DishType } from '@/schemaValidations/dish.schema'
import { UtensilsCrossed } from 'lucide-react'
import { useMemo, useState } from 'react'

export function DishTable() {
  const { data: dishList, isLoading, isError } = useGetDishList()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DishType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DishType | null>(null)

  const columns = useMemo(
    () =>
      getDishColumns({
        onEdit: dish => setEditTarget(dish),
        onDelete: dish => setDeleteTarget(dish),
      }),
    []
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
        onDelete={dish => setDeleteTarget(dish)}
      />

      <CreateDishDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditDishDialog
        dish={editTarget}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
      />

      <DeleteDishDialog
        dish={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      />
    </>
  )
}
