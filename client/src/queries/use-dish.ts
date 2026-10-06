import { httpClient } from '@/lib/httpClient'
import type {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
  UpdateDishStatusBodyType,
} from '@app/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { i18n } from '@/lib/i18n'

// Query Options

export const dishListQueryOptions = queryOptions({
  queryKey: ['dishes', 'list'],
  queryFn: async () => {
    const res = await httpClient.get<DishListResType>('/dishes')
    return res.data.data
  },
})

// Query Hooks

export function useGetDishList() {
  return useQuery(dishListQueryOptions)
}

export function useGetDish(id: number) {
  return useQuery({
    queryKey: ['dishes', 'detail', id],
    queryFn: async () => {
      const res = await httpClient.get<DishResType>(`/dishes/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

// Mutation Hooks

export function useCreateDishMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDishBodyType) => httpClient.post<DishResType>('/dishes', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })
    },
  })
}

export function useUpdateDishMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateDishBodyType }) =>
      httpClient.put<DishResType>(`/dishes/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })
    },
  })
}

export function useDeleteDishMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete<DishResType>(`/dishes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })
    },
  })
}

/**
 * Cập nhật nhanh trạng thái món ăn (Available / Unavailable / Hidden).
 * Dùng optimistic update để UI phản hồi ngay, rollback nếu server lỗi.
 */
export function useToggleDishStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: UpdateDishStatusBodyType['status'] }) =>
      httpClient.patch<DishResType>(`/dishes/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      // Huỷ refetch đang chờ để tránh override optimistic update
      await queryClient.cancelQueries({ queryKey: ['dishes', 'list'] })

      // Lưu snapshot để rollback khi lỗi
      const previous = queryClient.getQueryData(['dishes', 'list'])

      // Optimistic update: cập nhật cache ngay lập tức
      queryClient.setQueryData<DishListResType['data']>(['dishes', 'list'], old =>
        old?.map(d => (d.id === id ? { ...d, status } : d))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Rollback về snapshot trước đó nếu API lỗi
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['dishes', 'list'], context.previous)
      }
      toast.error(i18n.t('manage:dishes.statusUpdateError'))
    },
    onSettled: () => {
      // Luôn refetch để đảm bảo đồng bộ với server
      queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })
    },
  })
}
