import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtSignOptions } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { EntityErrorException } from '../common/index.js'
import type { EnvType } from '../config/env.config.js'
import { TokenType, type RoleType, type TokenPayload } from '../constants/type.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type { LoginBodyType } from './dto/auth.schema.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvType, true>
  ) {}

  private signAccessToken(payload: Pick<TokenPayload, 'userId' | 'role'>) {
    return this.jwtService.sign(
      { ...payload, tokenType: TokenType.AccessToken },
      {
        secret: this.configService.get('ACCESS_TOKEN_SECRET', { infer: true }),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES_IN', { infer: true }) as JwtSignOptions['expiresIn'],
      }
    )
  }

  private signRefreshToken(payload: Pick<TokenPayload, 'userId' | 'role'> & { exp?: number }) {
    const { exp, ...rest } = payload
    if (exp) {
      // Giữ nguyên thời hạn hết hạn gốc (khi rotate refresh token)
      return this.jwtService.sign(
        { ...rest, tokenType: TokenType.RefreshToken, exp },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET', { infer: true }),
        }
      )
    }
    return this.jwtService.sign(
      { ...rest, tokenType: TokenType.RefreshToken },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET', { infer: true }),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true }) as JwtSignOptions['expiresIn'],
      }
    )
  }

  private verifyRefreshToken(token: string): TokenPayload {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET', { infer: true }),
      })
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }
  }

  async login(body: LoginBodyType) {
    const account = await this.prisma.account.findUnique({
      where: { email: body.email },
    })

    if (!account) {
      throw new EntityErrorException([{ field: 'email', message: 'Email không tồn tại' }])
    }

    const isPasswordMatch = await bcrypt.compare(body.password, account.password)
    if (!isPasswordMatch) {
      throw new EntityErrorException([
        { field: 'password', message: 'Email hoặc mật khẩu không đúng' },
      ])
    }

    const accessToken = this.signAccessToken({ userId: account.id, role: account.role as RoleType })
    const refreshToken = this.signRefreshToken({
      userId: account.id,
      role: account.role as RoleType,
    })

    const decodedRefreshToken = this.verifyRefreshToken(refreshToken)
    const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000)

    await this.prisma.refreshToken.create({
      data: {
        accountId: account.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
      },
    })

    return { account, accessToken, refreshToken }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.delete({
      where: { token: refreshToken },
    })
    return 'Đăng xuất thành công'
  }

  async refreshToken(token: string) {
    const decoded = this.verifyRefreshToken(token)

    const refreshTokenDoc = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { account: true },
    })

    if (!refreshTokenDoc) {
      throw new UnauthorizedException('Refresh token không tồn tại')
    }

    const { account } = refreshTokenDoc

    const newAccessToken = this.signAccessToken({
      userId: account.id,
      role: account.role as RoleType,
    })
    const newRefreshToken = this.signRefreshToken({
      userId: account.id,
      role: account.role as RoleType,
      exp: decoded.exp,
    })

    // Xóa token cũ, lưu token mới (rotation)
    await this.prisma.refreshToken.delete({ where: { token } })
    await this.prisma.refreshToken.create({
      data: {
        accountId: account.id,
        token: newRefreshToken,
        expiresAt: refreshTokenDoc.expiresAt,
      },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }
}
