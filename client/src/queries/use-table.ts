import { httpClient } from '@/lib/httpClient'
import type {
  CreateTableBodyType,
  TableListResType,
  TableResType,
  UpdateTableBodyType,
} from '@/schemaValidations/table.schema'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query Options─────

export const tableListQueryOptions = queryOptions({
  queryKey: ['tables', 'list'],
  queryFn: async () => {
    const res = await httpClient.get<TableListResType>('/tables')
    return res.data.data
  },
})

// Query Hooks───────

export function useGetTableList() {
  return useQuery(tableListQueryOptions)
}

export function useGetTable(number: number) {
  return useQuery({
    queryKey: ['tables', 'detail', number],
    queryFn: async () => {
      const res = await httpClient.get<TableResType>(`/tables/${number}`)
      return res.data.data
    },
    enabled: !!number,
  })
}

// Mutation Hooks────

export function useCreateTableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTableBodyType) => httpClient.post<TableResType>('/tables', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] })
    },
  })
}

export function useUpdateTableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ number, body }: { number: number; body: UpdateTableBodyType }) =>
      httpClient.put<TableResType>(`/tables/${number}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] })
    },
  })
}

export function useDeleteTableMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (number: number) => httpClient.delete<TableResType>(`/tables/${number}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', 'list'] })
    },
  })
}
