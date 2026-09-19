import { ForbiddenException } from '@nestjs/common'

export class ForbiddenError extends ForbiddenException {
  constructor(message = 'Không có quyền truy cập') {
    super(message)
  }
}
