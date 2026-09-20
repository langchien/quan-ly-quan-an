import { httpClient } from '@/lib/httpClient'
import type {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from '@/schemaValidations/dish.schema'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query Options─────

export const dishListQueryOptions = queryOptions({
  queryKey: ['dishes', 'list'],
  queryFn: async () => {
    const res = await httpClient.get<DishListResType>('/dishes')
    return res.data.data
  },
})

// Query Hooks───────

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

// Mutation Hooks────

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
