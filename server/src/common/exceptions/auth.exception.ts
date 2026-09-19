import { UnauthorizedException } from '@nestjs/common'

export class AuthError extends UnauthorizedException {
  constructor(message = 'Không được phép truy cập') {
    super(message)
  }
}
