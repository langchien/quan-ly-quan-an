import { handleErrorApi } from '@/lib/handleErrorApi'
import { useLoginMutation } from '@/queries/use-auth'
import { LoginBody, type LoginBodyType } from '@/schemaValidations/auth.schema'
import { useAuthStore } from '@/store/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

export function useLogin() {
  const loginMutation = useLoginMutation()
  const setTokens = useAuthStore(state => state.setTokens)
  const router = useRouter()
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  async function onSubmit(values: LoginBodyType) {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(values)
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
