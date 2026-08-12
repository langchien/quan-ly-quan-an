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

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden p-0'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8'>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Tạo tài khoản</h1>
                <p className='text-sm text-balance text-muted-foreground'>
                  Nhập email của bạn bên dưới để tạo tài khoản
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input id='email' type='email' placeholder='m@example.com' required />
                <FieldDescription>
                  Chúng tôi sẽ dùng email này để liên hệ với bạn. Chúng tôi sẽ không chia sẻ email
                  của bạn với bất kỳ ai khác.
                </FieldDescription>
              </Field>
              <Field>
                <Field className='grid grid-cols-2 gap-4'>
                  <Field>
                    <FieldLabel htmlFor='password'>Mật khẩu</FieldLabel>
                    <InputPassword id='password' required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='confirm-password'>Xác nhận mật khẩu</FieldLabel>
                    <InputPassword id='confirm-password' required />
                  </Field>
                </Field>
                <FieldDescription>Mật khẩu phải có ít nhất 8 ký tự.</FieldDescription>
              </Field>
              <Field>
                <Button type='submit'>Tạo tài khoản</Button>
              </Field>
              <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
                Hoặc tiếp tục với
              </FieldSeparator>
              <Field>
                <GoogleButton>Đăng ký bằng Google</GoogleButton>
              </Field>
              <FieldDescription className='text-center'>
                Đã có tài khoản? <Link to='/login'>Đăng nhập</Link>
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
