import type { ZodType, z } from 'zod'

export interface ZodDto<TOutput = any> {
  new (): TOutput
  readonly isZodDto: true
  readonly schema: ZodType<TOutput>
}

export function createZodDto<TSchema extends ZodType>(schema: TSchema): ZodDto<z.infer<TSchema>> {
  class SchemaDto {
    public static readonly isZodDto = true as const
    public static readonly schema = schema
  }

  return SchemaDto as unknown as ZodDto<z.infer<TSchema>>
}

export function isZodDto(metatype: any): metatype is ZodDto {
  return typeof metatype === 'function' && metatype.isZodDto === true && Boolean(metatype.schema)
}
