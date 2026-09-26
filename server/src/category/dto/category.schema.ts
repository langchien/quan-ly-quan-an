import z from 'zod'

// Category Schema (response)

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CategorySchemaType = z.TypeOf<typeof CategorySchema>

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

// Create Category

export const CreateCategoryBody = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100),
  order: z.number().int().min(0).optional(),
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

// Update Category

export const UpdateCategoryBody = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100),
  order: z.number().int().min(0).optional(),
})

export type UpdateCategoryBodyType = z.TypeOf<typeof UpdateCategoryBody>

// Params

export const CategoryParams = z.object({
  id: z.coerce.number(),
})

export type CategoryParamsType = z.TypeOf<typeof CategoryParams>
