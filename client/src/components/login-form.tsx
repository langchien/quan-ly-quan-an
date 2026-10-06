import { GoogleButton } from '@/components/google-button'
import { InputPassword } from '@/components/input-password'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/hooks/useLogin'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')
  const { form, onSubmit, isPending } = useLogin()

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>{t('login.title')}</h1>
                <p className='text-balance text-muted-foreground'>{t('login.subtitle')}</p>
              </div>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='email'>{t('common.email')}</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id='email'
                      type='email'
                      placeholder='m@example.com'
                      required
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='password'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className='flex items-center'>
                      <FieldLabel htmlFor='password'>{t('common.password')}</FieldLabel>
                      <a href='#' className='ml-auto text-sm underline-offset-2 hover:underline'>
                        {t('login.forgotPassword')}
                      </a>
                    </div>
                    <InputPassword
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id='password'
                      required
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field>
                <Button type='submit' disabled={isPending} className='w-full gap-2'>
                  {isPending && <Loader2 className='size-4 animate-spin' />}
                  {isPending ? t('login.submitting') : t('login.submit')}
                </Button>
              </Field>
              <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
                {t('common.orContinueWith')}
              </FieldSeparator>
              <Field>
                <GoogleButton>{t('login.google')}</GoogleButton>
              </Field>
              <FieldDescription className='text-center'>
                {t('login.noAccount')} <Link to='/signup'>{t('login.signup')}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className='relative hidden bg-muted md:block'>
            <img
              src='/banner-login.png'
              alt={t('common.bannerAlt')}
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className='px-6 text-center'>
        {t('common.termsPrefix')} <a href='#'>{t('common.terms')}</a> {t('common.and')}{' '}
        <a href='#'>{t('common.privacy')}</a> {t('common.termsSuffix')}
      </FieldDescription>
    </div>
  )
}
