import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { TokenPayload, RoleType } from '../../constants/type.js'
import { Roles } from '../decorators/roles.decorator.js'

/**
 * Guard kiểm tra role từ JWT payload.
 *
 * Sử dụng cùng với @Roles() decorator:
 *   @UseGuards(AccessTokenGuard, RolesGuard)
 *   @Roles([Role.Owner])
 *
 * Nếu không có @Roles() trên handler → cho phép mọi role (chỉ cần đăng nhập).
 * Nếu có @Roles() → kiểm tra user.role có nằm trong danh sách cho phép hay không.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách role yêu cầu từ handler (method) hoặc class (controller)
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[] | undefined>(Roles, [
      context.getHandler(),
      context.getClass(),
    ])

    // Không có @Roles() → endpoint mở cho mọi authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user as TokenPayload

    if (!user || !user.role) {
      throw new ForbiddenException('Không có thông tin phân quyền')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện chức năng này. Yêu cầu quyền: ${requiredRoles.join(', ')}`
      )
    }

    return true
  }
}
