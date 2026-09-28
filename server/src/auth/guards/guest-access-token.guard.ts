import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import type { EnvType } from '../../config/env.config.js'
import { Role, TokenType, type TokenPayload } from '@app/shared'

/**
 * Guard d�nh ri�ng cho guest.
 * Verify access token b?ng GUEST_ACCESS_TOKEN_SECRET v� ki?m tra role === Guest.
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
      throw new UnauthorizedException('Kh�ng nh?n du?c access token')
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get('GUEST_ACCESS_TOKEN_SECRET', { infer: true }),
      })

      if (payload.tokenType !== TokenType.AccessToken) {
        throw new UnauthorizedException('Token kh�ng ph?i l� access token')
      }

      if (payload.role !== Role.Guest) {
        throw new UnauthorizedException('Ch? kh�ch h�ng m?i c� quy?n truy c?p')
      }

      ;(request as any).user = payload
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Access token kh�ng h?p l?')
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
