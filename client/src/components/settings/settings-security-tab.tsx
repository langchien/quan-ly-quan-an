import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ChangePasswordBody, type ChangePasswordBodyType } from '@app/shared'
import { useChangePasswordMutation } from '@/queries/use-account'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { InputPassword } from '@/components/input-password'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function SettingsSecurityTab() {
  const { t, i18n } = useTranslation('settings')
  const changePasswordMutation = useChangePasswordMutation()

  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ChangePasswordBodyType) {
    if (changePasswordMutation.isPending) return
    try {
      const res = await changePasswordMutation.mutateAsync(values)
      toast.success(
        i18n.language === 'en' ? t('security.success') : res.data.message || t('security.success')
      )
      form.reset()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <ShieldCheck className='size-5' />
        </div>
        <div>
          <p className='text-sm font-semibold'>{t('security.title')}</p>
          <p className='text-xs text-muted-foreground'>{t('security.description')}</p>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
        {/* Mật khẩu cũ */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='settings-oldPassword' className='text-sm font-medium'>
            {t('security.oldPassword')}
          </Label>
          <InputPassword
            id='settings-oldPassword'
            placeholder={t('security.oldPasswordPlaceholder')}
            {...form.register('oldPassword')}
          />
          {form.formState.errors.oldPassword && (
            <p className='text-sm text-destructive'>{form.formState.errors.oldPassword.message}</p>
          )}
        </div>

        <Separator />

        {/* Mật khẩu mới */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='settings-password' className='text-sm font-medium'>
            {t('security.newPassword')}
          </Label>
          <InputPassword
            id='settings-password'
            placeholder={t('security.newPasswordPlaceholder')}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className='text-sm text-destructive'>{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='settings-confirmPassword' className='text-sm font-medium'>
            {t('security.confirmPassword')}
          </Label>
          <InputPassword
            id='settings-confirmPassword'
            placeholder={t('security.confirmPasswordPlaceholder')}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword && (
            <p className='text-sm text-destructive'>
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className='flex items-center gap-2 pt-1'>
          <Button type='button' variant='outline' size='sm' onClick={() => form.reset()}>
            {t('security.cancel')}
          </Button>
          <Button
            type='submit'
            size='sm'
            disabled={changePasswordMutation.isPending}
            className='gap-2'
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Save className='size-3.5' />
            )}
            {t('security.submit')}
          </Button>
        </div>
      </form>
    </div>
  )
}
