import z from "zod";

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CategoryType = z.output<typeof CategorySchema>;

export const CategoryRes = z.object({
  data: CategorySchema,
  message: z.string(),
});

export type CategoryResType = z.output<typeof CategoryRes>;

export const CategoryListRes = z.object({
  data: z.array(CategorySchema),
  message: z.string(),
});

export type CategoryListResType = z.output<typeof CategoryListRes>;

export const CreateCategoryBody = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").max(100),
  order: z.number().int().min(0).optional(),
});

export type CreateCategoryBodyType = z.output<typeof CreateCategoryBody>;

export const UpdateCategoryBody = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống").max(100),
  order: z.number().int().min(0).optional(),
});

export type UpdateCategoryBodyType = z.output<typeof UpdateCategoryBody>;

export const CategoryParams = z.object({
  id: z.coerce.number(),
});

export type CategoryParamsType = z.output<typeof CategoryParams>;
