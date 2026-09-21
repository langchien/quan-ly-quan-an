import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { AccessTokenGuard } from './guards/access-token.guard.js'
import { ActiveUser } from './decorators/active-user.decorator.js'
import { ZodBody } from '../common/index.js'
import {
  LoginBody,
  type LoginBodyType,
  LogoutBody,
  type LogoutBodyType,
  RefreshTokenBody,
  type RefreshTokenBodyType,
} from './dto/auth.schema.js'
import type { TokenPayload } from '../constants/type.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Đăng nhập, trả về accessToken + refreshToken
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@ZodBody(LoginBody) body: LoginBodyType) {
    const { account, accessToken, refreshToken } = await this.authService.login(body)
    return {
      message: 'Đăng nhập thành công',
      data: {
        account: {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
        },
        accessToken,
        refreshToken,
      },
    }
  }

  /**
   * POST /auth/logout
   * Đăng xuất — yêu cầu access token hợp lệ
   */
  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@ZodBody(LogoutBody) body: LogoutBodyType, @ActiveUser() _user: TokenPayload) {
    const message = await this.authService.logout(body.refreshToken)
    return { message }
  }

  /**
   * POST /auth/refresh-token
   * Lấy cặp token mới bằng refresh token cũ
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@ZodBody(RefreshTokenBody) body: RefreshTokenBodyType) {
    const result = await this.authService.refreshToken(body.refreshToken)
    return {
      message: 'Lấy token mới thành công',
      data: result,
    }
  }
}
