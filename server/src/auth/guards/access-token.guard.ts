import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import type { EnvType } from '../../config/env.config.js'
import { TokenType, type TokenPayload } from '../../constants/type.js'

@Injectable()
export class AccessTokenGuard implements CanActivate {
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
        secret: this.configService.get('ACCESS_TOKEN_SECRET', { infer: true }),
      })

      if (payload.tokenType !== TokenType.AccessToken) {
        throw new UnauthorizedException('Token không phải là access token')
      }

      // Gắn payload vào request để controller có thể dùng @ActiveUser()
      ;(request as any).user = payload
    } catch {
      throw new UnauthorizedException('Access token không hợp lệ')
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
