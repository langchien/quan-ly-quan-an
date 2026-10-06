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
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useCreateEmployeeAccountMutation, useUploadAvatarMutation } from '@/queries/use-account'
import { CreateEmployeeAccountBody, type CreateEmployeeAccountBodyType } from '@app/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface CreateStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStaffDialog({ open, onOpenChange }: CreateStaffDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const [file, setFile] = useState<File | null>(null)
  const createStaffMutation = useCreateEmployeeAccountMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CreateEmployeeAccountBodyType>({
    resolver: zodResolver(CreateEmployeeAccountBody),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: undefined,
    },
  })

  const avatarValue = form.watch('avatar')
  const errors = form.formState.errors

  const previewAvatar = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return avatarValue || undefined
  }, [file, avatarValue])

  async function onSubmit(values: CreateEmployeeAccountBodyType) {
    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await uploadAvatarMutation.mutateAsync(formData)
        body = { ...values, avatar: uploadRes.data.data }
      }
      const res = await createStaffMutation.mutateAsync(body)
      toast.success(res.data.message || t('staffs.createDialog.success'))
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

  const isPending = createStaffMutation.isPending || uploadAvatarMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-[500px] overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('staffs.createDialog.title')}</DialogTitle>
          <DialogDescription>{t('staffs.createDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          {/* Avatar */}
          <div className='flex flex-col items-center gap-3'>
            <div
              className='group relative cursor-pointer'
              onClick={() => avatarInputRef.current?.click()}
            >
              <Avatar className='size-20 rounded-2xl ring-2 ring-border transition-all group-hover:ring-primary'>
                <AvatarImage src={previewAvatar} className='object-cover' />
                <AvatarFallback className='rounded-2xl bg-primary/10 text-lg font-semibold text-primary'>
                  {(form.watch('name') || '').charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <Camera className='size-5 text-white' />
              </div>
              {uploadAvatarMutation.isPending && (
                <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50'>
                  <Loader2 className='size-5 animate-spin text-white' />
                </div>
              )}
              <input
                ref={avatarInputRef}
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
            <p className='text-xs text-muted-foreground'>{t('staffs.createDialog.avatarHint')}</p>
          </div>

          <FieldGroup>
            {/* Tên */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='create-staff-name'>
                {t('staffs.createDialog.nameLabel')}
              </FieldLabel>
              <Input
                id='create-staff-name'
                placeholder={t('staffs.createDialog.namePlaceholder')}
                {...form.register('name')}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/* Email */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='create-staff-email'>
                {t('staffs.createDialog.emailLabel')}
              </FieldLabel>
              <Input
                id='create-staff-email'
                type='email'
                placeholder={t('staffs.createDialog.emailPlaceholder')}
                {...form.register('email')}
                aria-invalid={!!errors.email}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            {/* Mật khẩu */}
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor='create-staff-password'>
                {t('staffs.createDialog.passwordLabel')}
              </FieldLabel>
              <Input
                id='create-staff-password'
                type='password'
                placeholder={t('staffs.createDialog.passwordPlaceholder')}
                {...form.register('password')}
                aria-invalid={!!errors.password}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            {/* Xác nhận mật khẩu */}
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor='create-staff-confirm-password'>
                {t('staffs.createDialog.confirmPasswordLabel')}
              </FieldLabel>
              <Input
                id='create-staff-confirm-password'
                type='password'
                placeholder={t('staffs.createDialog.confirmPasswordPlaceholder')}
                {...form.register('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
              />
              <FieldError
                errors={[
                  errors.confirmPassword?.message === 'Mật khẩu không khớp'
                    ? { message: t('staffs.createDialog.passwordMismatch') }
                    : errors.confirmPassword,
                ]}
              />
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
                  {t('staffs.createDialog.submitting')}
                </>
              ) : (
                t('staffs.createDialog.submit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
