import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DishStatus } from '@app/shared'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useUploadAvatarMutation } from '@/queries/use-account'
import { useGetCategoryList } from '@/queries/use-category'
import { useUpdateDishMutation } from '@/queries/use-dish'
import { UpdateDishBody, type DishType, type UpdateDishBodyType } from '@app/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useStatusLabel } from '@/lib/status-label'

interface EditDishDialogProps {
  dish: DishType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDishDialog({ dish, open, onOpenChange }: EditDishDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const { dishStatusOptions } = useStatusLabel()
  const [file, setFile] = useState<File | null>(null)
  const updateDishMutation = useUpdateDishMutation()
  const uploadImageMutation = useUploadAvatarMutation()
  const { data: categories } = useGetCategoryList()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<UpdateDishBodyType, unknown, UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody) as any,
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      image: '',
      status: DishStatus.Available,
      categoryId: null,
    },
  })

  const imageValue = form.watch('image')
  const errors = form.formState.errors

  const previewImage = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return imageValue || undefined
  }, [file, imageValue])

  // Cleanup object URL on unmount/file change
  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(previewImage ?? '')
    }
  }, [file, previewImage])

  // Pre-fill form khi dish thay đổi
  useEffect(() => {
    if (dish) {
      form.reset({
        name: dish.name,
        price: dish.price,
        description: dish.description,
        image: dish.image,
        status: dish.status,
        categoryId: dish.categoryId ?? null,
      })
      setFile(null)
    }
  }, [dish, form])

  async function onSubmit(values: UpdateDishBodyType) {
    if (!dish) return
    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await uploadImageMutation.mutateAsync(formData)
        body = { ...values, image: uploadRes.data.data }
      }
      const res = await updateDishMutation.mutateAsync({ id: dish.id, body })
      toast.success(res.data.message || t('dishes.editDialog.success'))
      handleOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      form.reset()
      setFile(null)
    }
    onOpenChange(value)
  }

  const isPending = updateDishMutation.isPending || uploadImageMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-[500px] overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('dishes.editDialog.title')}</DialogTitle>
          <DialogDescription>{t('dishes.editDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          {/* Ảnh món ăn */}
          <div className='flex flex-col items-center gap-3'>
            <div
              className='group relative cursor-pointer'
              onClick={() => imageInputRef.current?.click()}
            >
              <Avatar className='size-24 rounded-2xl ring-2 ring-border transition-all group-hover:ring-primary'>
                <AvatarImage src={previewImage} className='object-cover' />
                <AvatarFallback className='rounded-2xl bg-primary/10 text-2xl'>🍽️</AvatarFallback>
              </Avatar>
              <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <Camera className='size-5 text-white' />
              </div>
              {uploadImageMutation.isPending && (
                <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50'>
                  <Loader2 className='size-5 animate-spin text-white' />
                </div>
              )}
              <input
                ref={imageInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={e => {
                  const selected = e.target.files?.[0]
                  if (selected) setFile(selected)
                  e.target.value = ''
                }}
              />
            </div>
            <p className='text-xs text-muted-foreground'>{t('dishes.createDialog.uploadHint')}</p>
            {errors.image && <p className='text-xs text-destructive'>{errors.image.message}</p>}
          </div>

          <FieldGroup>
            {/* Tên món ăn */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='edit-dish-name'>{t('dishes.createDialog.nameLabel')}</FieldLabel>
              <Input
                id='edit-dish-name'
                placeholder={t('dishes.createDialog.namePlaceholder')}
                {...form.register('name')}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/* Giá */}
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor='edit-dish-price'>{t('dishes.createDialog.priceLabel')}</FieldLabel>
              <Input
                id='edit-dish-price'
                type='number'
                min={0}
                placeholder={t('dishes.createDialog.pricePlaceholder')}
                {...form.register('price')}
                aria-invalid={!!errors.price}
              />
              <FieldError errors={[errors.price]} />
            </Field>

            {/* Mô tả */}
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor='edit-dish-description'>{t('dishes.createDialog.descriptionLabel')}</FieldLabel>
              <Textarea
                id='edit-dish-description'
                placeholder={t('dishes.createDialog.descriptionPlaceholder')}
                rows={3}
                {...form.register('description')}
                aria-invalid={!!errors.description}
              />
              <FieldError errors={[errors.description]} />
            </Field>

            {/* Danh mục */}
            <Field>
              <FieldLabel htmlFor='edit-dish-category'>{t('dishes.createDialog.categoryLabel')}</FieldLabel>
              <Controller
                name='categoryId'
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value != null ? String(field.value) : '__none__'}
                    onValueChange={v => field.onChange(v === '__none__' ? null : Number(v))}
                  >
                    <SelectTrigger id='edit-dish-category' className='w-full'>
                      <SelectValue placeholder={t('dishes.createDialog.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='__none__'>{t('dishes.uncategorized', { defaultValue: 'Không có danh mục' })}</SelectItem>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Trạng thái */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor='edit-dish-status'>{t('dishes.createDialog.statusLabel')}</FieldLabel>
              <Controller
                name='status'
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id='edit-dish-status' className='w-full'>
                      <SelectValue placeholder={t('common:table.allStatuses', { defaultValue: 'Chọn trạng thái' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {dishStatusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  {t('dishes.editDialog.submitting')}
                </>
              ) : (
                t('dishes.editDialog.submit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
