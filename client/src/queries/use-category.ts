import { httpClient } from '@/lib/httpClient'
import type {
  CategoryListResType,
  CategoryResType,
  CreateCategoryBodyType,
  UpdateCategoryBodyType,
} from '@/schemaValidations/category.schema'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query Options

export const categoryListQueryOptions = queryOptions({
  queryKey: ['categories', 'list'],
  queryFn: async () => {
    const res = await httpClient.get<CategoryListResType>('/categories')
    return res.data.data
  },
})

// Query Hooks

export function useGetCategoryList() {
  return useQuery(categoryListQueryOptions)
}

// Mutation Hooks

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCategoryBodyType) =>
      httpClient.post<CategoryResType>('/categories', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] })
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateCategoryBodyType }) =>
      httpClient.put<CategoryResType>(`/categories/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] })
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete<CategoryResType>(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', 'list'] })
      // Invalidate dishes too — their category reference may have changed
      queryClient.invalidateQueries({ queryKey: ['dishes', 'list'] })
    },
  })
}
