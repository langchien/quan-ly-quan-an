import z from 'zod'
import { DishStatusValues } from '../constants.js'
import { CategorySchema } from './category.schema.js'

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  image: z.string().url(),
  status: z.enum(DishStatusValues).optional(),
  categoryId: z.number().nullable().optional(),
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum(DishStatusValues),
  categoryId: z.number().nullable(),
  category: CategorySchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DishType = z.TypeOf<typeof DishSchema>

export const DishRes = z.object({
  data: DishSchema,
  message: z.string(),
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  data: z.array(DishSchema),
  message: z.string(),
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const UpdateDishBody = CreateDishBody
export type UpdateDishBodyType = CreateDishBodyType

export const UpdateDishStatusBody = z.object({
  status: z.enum(DishStatusValues),
})

export type UpdateDishStatusBodyType = z.TypeOf<typeof UpdateDishStatusBody>

export const DishParams = z.object({
  id: z.coerce.number(),
})

export type DishParamsType = z.TypeOf<typeof DishParams>
