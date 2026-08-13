import { httpClient } from '@/lib/httpClient'
import type { LoginBodyType, LoginResType, LogoutBodyType } from '@/schemaValidations/auth.schema'
import { useMutation } from '@tanstack/react-query'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (body: LoginBodyType) => httpClient.post<LoginResType>('/auth/login', body),
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: (body: LogoutBodyType) => httpClient.post('/auth/logout', body),
  })
}
