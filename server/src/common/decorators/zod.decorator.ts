import { Body, Param, Query } from '@nestjs/common'
import type { ZodType } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js'

/**
 * Decorator lấy request body và validate bằng Zod Schema truyền vào.
 * Ví dụ: @ZodBody(LoginBody) body: LoginBodyType
 */
export const ZodBody = (schema: ZodType) => Body(new ZodValidationPipe(schema))

/**
 * Decorator lấy query parameters và validate bằng Zod Schema truyền vào.
 * Ví dụ: @ZodQuery(PaginationSchema) query: PaginationType
 */
export const ZodQuery = (schema: ZodType) => Query(new ZodValidationPipe(schema))

/**
 * Decorator lấy route parameters và validate bằng Zod Schema truyền vào.
 * Ví dụ: @ZodParam(TableParams) params: TableParamsType
 */
export const ZodParam = (schema: ZodType) => Param(new ZodValidationPipe(schema))
