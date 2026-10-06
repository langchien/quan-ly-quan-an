import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { handleErrorApi } from '@/lib/handleErrorApi'
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryList,
  useUpdateCategoryMutation,
} from '@/queries/use-category'
import {
  CreateCategoryBody,
  type CreateCategoryBodyType,
  type CategoryType,
  UpdateCategoryBody,
  type UpdateCategoryBodyType,
} from '@app/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit2, FolderOpen, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

// Main Component

export function CategoryManager() {
  const { t } = useTranslation(['manage', 'common'])
  const { data: categories, isLoading } = useGetCategoryList()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoryType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null)

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>
            {t('dishes.categoryManager.title')}
          </h2>
          <p className='text-sm text-muted-foreground'>{t('dishes.categoryManager.description')}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size='sm' className='gap-1.5'>
          <Plus className='h-4 w-4' />
          {t('dishes.categoryManager.addCategory')}
        </Button>
      </div>

      {isLoading ? (
        <div className='space-y-2'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-14 animate-pulse rounded-lg bg-muted' />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className='space-y-2'>
          {categories.map(cat => (
            <div
              key={cat.id}
              className='flex items-center justify-between rounded-lg border bg-card px-4 py-3'
            >
              <div className='flex items-center gap-3'>
                <FolderOpen className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>{cat.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {t('common:table.order', { defaultValue: 'Thứ tự' })}: {cat.order}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setEditTarget(cat)}
                  aria-label={`${t('common:actions.edit')} ${cat.name}`}
                >
                  <Edit2 className='h-3.5 w-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-destructive hover:text-destructive'
                  onClick={() => setDeleteTarget(cat)}
                  aria-label={`${t('common:actions.delete')} ${cat.name}`}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center'>
          <FolderOpen className='mb-2 h-8 w-8 text-muted-foreground/40' />
          <p className='text-sm text-muted-foreground'>{t('dishes.categoryManager.empty')}</p>
          <p className='mt-1 text-xs text-muted-foreground/70'>
            {t('dishes.categoryManager.description')}
          </p>
        </div>
      )}

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditCategoryDialog
        category={editTarget}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
      />
      <DeleteCategoryDialog
        category={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      />
    </div>
  )
}

// Create Dialog

function CreateCategoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['manage', 'common'])
  const createMutation = useCreateCategoryMutation()
  const form = useForm<CreateCategoryBodyType>({
    resolver: zodResolver(CreateCategoryBody) as any,
    defaultValues: { name: '', order: 0 },
  })

  async function onSubmit(values: CreateCategoryBodyType) {
    try {
      const res = await createMutation.mutateAsync(values)
      toast.success(res.data.message || t('dishes.categoryManager.createSuccess'))
      handleClose()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  function handleClose() {
    form.reset()
    onOpenChange(false)
  }

  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className='max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>{t('dishes.categoryManager.addCategory')}</DialogTitle>
          <DialogDescription>{t('dishes.categoryManager.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='create-cat-name'>
                {t('dishes.createDialog.categoryLabel')}
              </FieldLabel>
              <Input
                id='create-cat-name'
                placeholder={t('dishes.categoryManager.namePlaceholder')}
                {...form.register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.order}>
              <FieldLabel htmlFor='create-cat-order'>
                {t('common:table.order', { defaultValue: 'Thứ tự hiển thị' })}
              </FieldLabel>
              <Input
                id='create-cat-order'
                type='number'
                min={0}
                placeholder='0'
                {...form.register('order', { valueAsNumber: true })}
              />
              <FieldError errors={[errors.order]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  {t('dishes.createDialog.submitting')}
                </>
              ) : (
                t('dishes.categoryManager.addCategory')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Edit Dialog

function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category: CategoryType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['manage', 'common'])
  const updateMutation = useUpdateCategoryMutation()
  const form = useForm<UpdateCategoryBodyType>({
    resolver: zodResolver(UpdateCategoryBody) as any,
    defaultValues: { name: '', order: 0 },
  })

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name, order: category.order })
    }
  }, [category, form])

  async function onSubmit(values: UpdateCategoryBodyType) {
    if (!category) return
    try {
      const res = await updateMutation.mutateAsync({ id: category.id, body: values })
      toast.success(res.data.message || t('dishes.categoryManager.updateSuccess'))
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const errors = form.formState.errors

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>{t('common:actions.edit')}</DialogTitle>
          <DialogDescription>{t('dishes.editDialog.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='edit-cat-name'>
                {t('dishes.createDialog.categoryLabel')}
              </FieldLabel>
              <Input id='edit-cat-name' {...form.register('name')} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.order}>
              <FieldLabel htmlFor='edit-cat-order'>
                {t('common:table.order', { defaultValue: 'Thứ tự hiển thị' })}
              </FieldLabel>
              <Input
                id='edit-cat-order'
                type='number'
                min={0}
                {...form.register('order', { valueAsNumber: true })}
              />
              <FieldError errors={[errors.order]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type='submit' disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  {t('common:actions.saving')}
                </>
              ) : (
                t('common:actions.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Delete Dialog

function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category: CategoryType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation(['manage', 'common'])
  const deleteMutation = useDeleteCategoryMutation()

  async function handleDelete() {
    if (!category) return
    try {
      const res = await deleteMutation.mutateAsync(category.id)
      toast.success(res.data.message || t('dishes.categoryManager.deleteSuccess'))
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>{t('common:actions.delete')}</DialogTitle>
          <DialogDescription>
            {t('dishes.categoryManager.deleteConfirm', { name: category?.name ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button variant='destructive' onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                {t('common:actions.deleting')}
              </>
            ) : (
              t('common:actions.delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
