import { httpClient } from '@/lib/httpClient'
import type {
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  GetListGuestsResType,
  UpdateEmployeeAccountBodyType,
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

// Employee Management Hooks ────────────────────────────────────────────────

export const accountListQueryOptions = queryOptions({
  queryKey: ['accounts', 'list'],
  queryFn: async () => {
    const res = await httpClient.get<AccountListResType>('/accounts')
    return res.data.data
  },
})

export function useGetAccountList() {
  return useQuery(accountListQueryOptions)
}

export function useGetEmployeeAccount(id: number) {
  return useQuery({
    queryKey: ['accounts', 'detail', id],
    queryFn: async () => {
      const res = await httpClient.get<AccountResType>(`/accounts/detail/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateEmployeeAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEmployeeAccountBodyType) =>
      httpClient.post<AccountResType>('/accounts', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
  })
}

export function useUpdateEmployeeAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateEmployeeAccountBodyType }) =>
      httpClient.put<AccountResType>(`/accounts/detail/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
  })
}

export function useDeleteEmployeeAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete<AccountResType>(`/accounts/detail/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
  })
}

// Guest Management Hooks ────────────────────────────────────────────────────

export function useGetGuestList() {
  return useQuery({
    queryKey: ['accounts', 'guests'],
    queryFn: async () => {
      const res = await httpClient.get<GetListGuestsResType>('/accounts/guests')
      return res.data.data
    },
  })
}
