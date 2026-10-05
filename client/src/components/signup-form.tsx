import { GoogleButton } from '@/components/google-button'
import { InputPassword } from '@/components/input-password'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation('auth')

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8'>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>{t('signup.title')}</h1>
                <p className='text-sm text-balance text-muted-foreground'>{t('signup.subtitle')}</p>
              </div>
              <Field>
                <FieldLabel htmlFor='email'>{t('common.email')}</FieldLabel>
                <Input id='email' type='email' placeholder='m@example.com' required />
                <FieldDescription>{t('signup.emailHint')}</FieldDescription>
              </Field>
              <Field>
                <Field className='grid grid-cols-2 gap-4'>
                  <Field>
                    <FieldLabel htmlFor='password'>{t('common.password')}</FieldLabel>
                    <InputPassword id='password' required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='confirm-password'>
                      {t('signup.confirmPassword')}
                    </FieldLabel>
                    <InputPassword id='confirm-password' required />
                  </Field>
                </Field>
                <FieldDescription>{t('signup.passwordHint')}</FieldDescription>
              </Field>
              <Field>
                <Button type='submit'>{t('signup.submit')}</Button>
              </Field>
              <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
                {t('common.orContinueWith')}
              </FieldSeparator>
              <Field>
                <GoogleButton>{t('signup.google')}</GoogleButton>
              </Field>
              <FieldDescription className='text-center'>
                {t('signup.hasAccount')} <Link to='/login'>{t('signup.login')}</Link>
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
