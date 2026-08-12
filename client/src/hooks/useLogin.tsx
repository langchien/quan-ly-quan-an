import { handleErrorApi } from '@/lib/handleErrorApi'
import { httpClient } from '@/lib/httpClient'
import { LoginBody, type LoginBodyType, type LoginResType } from '@/schemaValidations/auth.schema'
import { useAuthStore } from '@/store/useAuthStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

function useLoginMutation() {
  return useMutation({
    mutationFn: (body: LoginBodyType) => httpClient.post<LoginResType>('/auth/login', body),
  })
}

export function useLogin() {
  const loginMutation = useLoginMutation()
  const setAuth = useAuthStore(state => state.setAuth)
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
      setAuth(result.data.data)
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
