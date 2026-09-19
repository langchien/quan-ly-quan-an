import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import type { ZodType } from 'zod'
import { isZodDto } from '../dto/zod.dto.js'
import { EntityErrorException, type EntityErrorItem } from '../exceptions/entity-error.exception.js'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodType) {}

  transform(value: unknown, metadata?: ArgumentMetadata) {
    let targetSchema = this.schema

    if (!targetSchema && metadata?.metatype && isZodDto(metadata.metatype)) {
      targetSchema = metadata.metatype.schema
    }

    if (!targetSchema) {
      return value
    }

    const result = targetSchema.safeParse(value)

    if (!result.success) {
      const errors: EntityErrorItem[] = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      throw new EntityErrorException(errors)
    }

    return result.data
  }
}
