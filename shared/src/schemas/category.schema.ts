import z from 'zod'

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CategoryType = z.TypeOf<typeof CategorySchema>

export const CategoryRes = z.object({
  data: CategorySchema,
  message: z.string(),
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

export const CategoryListRes = z.object({
  data: z.array(CategorySchema),
  message: z.string(),
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

export const CreateCategoryBody = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100),
  order: z.number().int().min(0).optional(),
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

export const UpdateCategoryBody = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100),
  order: z.number().int().min(0).optional(),
})

export type UpdateCategoryBodyType = z.TypeOf<typeof UpdateCategoryBody>

export const CategoryParams = z.object({
  id: z.coerce.number(),
})

export type CategoryParamsType = z.TypeOf<typeof CategoryParams>
