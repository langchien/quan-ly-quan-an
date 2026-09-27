import { handleErrorApi } from '@/lib/handleErrorApi'
import { useLoginMutation } from '@/queries/use-auth'
import { LoginBody, type LoginBodyType } from '@/schemaValidations/auth.schema'
import { useAuthStore } from '@/store/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

const REMEMBERED_EMAIL_KEY = 'qr-order:remembered-email'

export function useLogin() {
  const loginMutation = useLoginMutation()
  const setTokens = useAuthStore(state => state.setTokens)
  const router = useRouter()

  // Đọc email đã lưu từ localStorage
  const savedEmail = (() => {
    try {
      return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''
    } catch {
      return ''
    }
  })()

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: savedEmail,
      password: '',
    },
  })
  async function onSubmit(values: LoginBodyType) {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(values)
      // Lưu email đăng nhập thành công
      try {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email)
      } catch {
        // Bỏ qua nếu localStorage không khả dụng
      }
      setTokens(result.data.data)
      router.navigate({ to: '/manage/dashboard' })
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  return { form, onSubmit }
}
