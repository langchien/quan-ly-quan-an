import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Camera, Loader2, RotateCcw, Save } from 'lucide-react'

import { UpdateMeBody, type UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { useAccountMe, useUpdateMeMutation, useUploadAvatarMutation } from '@/queries/use-account'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function SettingsProfileTab() {
  const [file, setFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const { data: user, refetch } = useAccountMe()
  const updateMeMutation = useUpdateMeMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()

  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: { name: '', avatar: '' },
  })

  const avatarValue = form.watch('avatar')

  // Preview ảnh local chọn từ máy, ưu tiên blob URL nếu đang chọn file mới
  const previewAvatar = useMemo(() => {
    if (file) return URL.createObjectURL(file)
    return avatarValue || undefined
  }, [file, avatarValue])

  // Cleanup blob URL khi unmount hoặc file thay đổi
  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(previewAvatar ?? '')
    }
  }, [file, previewAvatar])

  // Điền dữ liệu user hiện tại khi data load xong
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        avatar: user.avatar ?? '',
      })
    }
  }, [user, form])

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const isPending = updateMeMutation.isPending || uploadAvatarMutation.isPending

  async function onSubmit(values: UpdateMeBodyType) {
    if (isPending) return
    try {
      let body = values
      // Nếu người dùng đã chọn file mới thì upload trước
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await uploadAvatarMutation.mutateAsync(formData)
        body = { ...values, avatar: uploadRes.data.data }
      }
      await updateMeMutation.mutateAsync(body)
      setFile(null)
      await refetch()
      toast.success('Cập nhật thông tin thành công!')
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  function onReset() {
    form.reset()
    setFile(null)
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header section */}
      <div className='flex items-start gap-5'>
        {/* Avatar */}
        <div
          className='group relative cursor-pointer'
          onClick={() => avatarInputRef.current?.click()}
        >
          <Avatar className='size-20 rounded-2xl ring-2 ring-border transition-all group-hover:ring-primary'>
            <AvatarImage src={previewAvatar} alt={user?.name} className='object-cover' />
            <AvatarFallback className='rounded-2xl bg-primary/10 text-lg font-semibold text-primary'>
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Overlay upload */}
          <div className='absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
            <Camera className='size-6 text-white' />
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
              e.target.value = '' // Reset để chọn lại cùng file
            }}
          />
        </div>

        {/* Thông tin user bên phải avatar */}
        <div className='flex flex-col gap-1.5 pt-1'>
          <p className='text-base leading-tight font-semibold'>{user?.name ?? '—'}</p>
          <p className='text-sm text-muted-foreground'>{user?.email ?? '—'}</p>
          <Badge variant='outline' className='mt-0.5 w-fit text-xs capitalize'>
            {user?.role === 'Owner' ? '👑 Chủ quán' : '👤 Nhân viên'}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={onReset}
        noValidate
        className='flex flex-col gap-5'
      >
        <div className='flex flex-col gap-2'>
          <Label htmlFor='settings-name' className='text-sm font-medium'>
            Tên hiển thị
          </Label>
          <Input
            id='settings-name'
            type='text'
            placeholder='Nhập tên của bạn'
            {...form.register('name')}
            className={form.formState.errors.name ? 'border-destructive' : ''}
          />
          {form.formState.errors.name && (
            <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className='flex items-center gap-2 pt-1'>
          <Button type='reset' variant='outline' size='sm' className='gap-2'>
            <RotateCcw className='size-3.5' />
            Hoàn tác
          </Button>
          <Button type='submit' size='sm' disabled={isPending} className='gap-2'>
            {isPending ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Save className='size-3.5' />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </form>

      {file && (
        <p className='-mt-3 text-xs text-muted-foreground'>
          <span className='font-medium text-amber-500'>⚠ Chưa lưu:</span> Ảnh mới chọn sẽ được
          upload khi bạn nhấn "Lưu thay đổi".
        </p>
      )}
    </div>
  )
}
