import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import type { EnvType } from '../../config/env.config.js'
import { Role, TokenType, type TokenPayload } from '../../constants/type.js'

/**
 * Guard dành riêng cho guest.
 * Verify access token bằng GUEST_ACCESS_TOKEN_SECRET và kiểm tra role === Guest.
 */
@Injectable()
export class GuestAccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvType, true>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('Không nhận được access token')
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('GUEST_ACCESS_TOKEN_SECRET', { infer: true }),
      })

      if (payload.tokenType !== TokenType.AccessToken) {
        throw new UnauthorizedException('Token không phải là access token')
      }

      if (payload.role !== Role.Guest) {
        throw new UnauthorizedException('Chỉ khách hàng mới có quyền truy cập')
      }

      ;(request as any).user = payload
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Access token không hợp lệ')
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
