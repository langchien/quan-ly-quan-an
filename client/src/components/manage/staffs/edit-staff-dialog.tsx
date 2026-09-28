import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useUpdateEmployeeAccountMutation, useUploadAvatarMutation } from '@/queries/use-account'
import {
  UpdateEmployeeAccountBody,
  type AccountType,
  type UpdateEmployeeAccountBodyType,
} from '@app/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface EditStaffDialogProps {
  staff: AccountType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStaffDialog({ staff, open, onOpenChange }: EditStaffDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const updateStaffMutation = useUpdateEmployeeAccountMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<UpdateEmployeeAccountBodyType>({
    resolver: zodResolver(UpdateEmployeeAccountBody),
    defaultValues: {
      name: '',
      email: '',
      avatar: undefined,
      changePassword: false,
      password: undefined,
      confirmPassword: undefined,
    },
  })

  const avatarValue = form.watch('avatar')
  const changePassword = form.watch('changePassword')
  const errors = form.formState.errors

  const previewAvatar = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return avatarValue || undefined
  }, [file, avatarValue])

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(previewAvatar ?? '')
    }
  }, [file, previewAvatar])

  useEffect(() => {
    if (staff) {
      form.reset({
        name: staff.name,
        email: staff.email,
        avatar: staff.avatar ?? undefined,
        changePassword: false,
        password: undefined,
        confirmPassword: undefined,
      })
      setFile(null)
    }
  }, [staff, form])

  async function onSubmit(values: UpdateEmployeeAccountBodyType) {
    if (!staff) return
    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await uploadAvatarMutation.mutateAsync(formData)
        body = { ...values, avatar: uploadRes.data.data }
      }
      const res = await updateStaffMutation.mutateAsync({ id: staff.id, body })
      toast.success(res.data.message || 'Cập nhật nhân viên thành công')
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

  const initials = staff?.name
    ? staff.name
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  const isPending = updateStaffMutation.isPending || uploadAvatarMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-[500px] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Cập nhật nhân viên</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin tài khoản nhân viên</DialogDescription>
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
                  {initials}
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
            <p className='text-xs text-muted-foreground'>Click vào ảnh để đổi</p>
          </div>

          <FieldGroup>
            {/* Tên */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor='edit-staff-name'>Tên nhân viên</FieldLabel>
              <Input
                id='edit-staff-name'
                placeholder='Nguyễn Văn A'
                {...form.register('name')}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            {/* Email */}
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor='edit-staff-email'>Email</FieldLabel>
              <Input
                id='edit-staff-email'
                type='email'
                placeholder='nhanvien@example.com'
                {...form.register('email')}
                aria-invalid={!!errors.email}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            {/* Toggle đổi mật khẩu — dùng shadcn Checkbox */}
            <Field orientation='horizontal'>
              <Checkbox
                id='edit-staff-change-password'
                checked={changePassword ?? false}
                onCheckedChange={checked => form.setValue('changePassword', checked === true)}
              />
              <FieldContent>
                <FieldTitle>
                  <label htmlFor='edit-staff-change-password' className='cursor-pointer'>
                    Đổi mật khẩu
                  </label>
                </FieldTitle>
                <FieldDescription>
                  Tích vào đây nếu muốn thay đổi mật khẩu nhân viên
                </FieldDescription>
              </FieldContent>
            </Field>

            {/* Mật khẩu mới (chỉ hiển thị khi changePassword = true) */}
            {changePassword && (
              <>
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor='edit-staff-password'>Mật khẩu mới</FieldLabel>
                  <Input
                    id='edit-staff-password'
                    type='password'
                    placeholder='Tối thiểu 6 ký tự'
                    {...form.register('password')}
                    aria-invalid={!!errors.password}
                  />
                  <FieldError errors={[errors.password]} />
                </Field>
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor='edit-staff-confirm-password'>
                    Xác nhận mật khẩu mới
                  </FieldLabel>
                  <Input
                    id='edit-staff-confirm-password'
                    type='password'
                    placeholder='Nhập lại mật khẩu mới'
                    {...form.register('confirmPassword')}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              </>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
