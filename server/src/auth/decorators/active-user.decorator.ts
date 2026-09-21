import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { TokenPayload } from '../../constants/type.js'

/**
 * Decorator lấy thông tin user đã đăng nhập từ JWT payload.
 * Tương đương `request.decodedAccessToken` trong server0.
 *
 * Ví dụ:
 *   @ActiveUser() user: TokenPayload
 *   @ActiveUser('userId') userId: number
 */
export const ActiveUser = createParamDecorator(
  (field: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as TokenPayload

    return field ? user?.[field] : user
  }
)
