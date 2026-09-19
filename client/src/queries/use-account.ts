import { httpClient } from '@/lib/httpClient'
import type {
  AccountResType,
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from '@/schemaValidations/account.schema'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const accountMeQueryOptions = queryOptions({
  queryKey: ['account', 'me'],
  queryFn: async () => {
    const res = await httpClient.get<AccountResType>('/accounts/me')
    return res.data.data
  },
  staleTime: 1000 * 60 * 5,
})

export function useAccountMe() {
  return useQuery(accountMeQueryOptions)
}

export function useUpdateMeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateMeBodyType) => httpClient.put<AccountResType>('/accounts/me', body),
    onSuccess: () => {
      // Invalidate làm mới dữ liệu cho toàn bộ app
      queryClient.invalidateQueries({ queryKey: ['account', 'me'] })
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (body: ChangePasswordBodyType) =>
      httpClient.put<{ data: AccountResType['data']; message: string }>(
        '/accounts/change-password',
        body
      ),
  })
}

export function useUploadAvatarMutation() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      httpClient.post<{ data: string; message: string }>('/media/upload', formData),
  })
}
