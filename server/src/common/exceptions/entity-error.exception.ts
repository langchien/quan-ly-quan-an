import { HttpException, HttpStatus } from '@nestjs/common'

export interface EntityErrorItem {
  field: string
  message: string
}

export interface EntityErrorResponse {
  message: string
  errors: EntityErrorItem[]
  statusCode: number
}

export class EntityErrorException extends HttpException {
  readonly errors: EntityErrorItem[]

  constructor(errors: EntityErrorItem[], message = 'Lỗi xảy ra khi xác thực dữ liệu...') {
    super(
      {
        message,
        errors,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      } satisfies EntityErrorResponse,
      HttpStatus.UNPROCESSABLE_ENTITY
    )
    this.errors = errors
  }
}
