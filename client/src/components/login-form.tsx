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
import { Controller } from 'react-hook-form'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { form, onSubmit } = useLogin()
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Xin chào quay trở lại</h1>
                <p className='text-balance text-muted-foreground'>
                  Đăng nhập vào tài khoản của bạn
                </p>
              </div>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='email'>Email</FieldLabel>
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
                      <FieldLabel htmlFor='password'>Mật khẩu</FieldLabel>
                      <a href='#' className='ml-auto text-sm underline-offset-2 hover:underline'>
                        Quên mật khẩu?
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
                <Button type='submit'>Đăng nhập</Button>
              </Field>
              <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
                Hoặc tiếp tục với
              </FieldSeparator>
              <Field>
                <GoogleButton>Đăng nhập bằng Google</GoogleButton>
              </Field>
              <FieldDescription className='text-center'>
                Chưa có tài khoản? <Link to='/signup'>Đăng ký</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className='relative hidden bg-muted md:block'>
            <img
              src='/banner-login.png'
              alt='Quản lý quán ăn'
              className='absolute inset-0 h-full w-full object-cover'
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className='px-6 text-center'>
        Bằng việc tiếp tục, bạn đồng ý với <a href='#'>Điều khoản dịch vụ</a> và{' '}
        <a href='#'>Chính sách bảo mật</a> của chúng tôi.
      </FieldDescription>
    </div>
  )
}
