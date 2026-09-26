import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Role, TokenType } from '../../constants/type.js'
import { GuestAccessTokenGuard } from './guest-access-token.guard.js'

// Helper tạo mock ExecutionContext

const createMockContext = (authHeader?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
      }),
    }),
  }) as unknown as ExecutionContext

describe('GuestAccessTokenGuard', () => {
  let guard: GuestAccessTokenGuard
  let jwtService: JwtService
  let configService: ConfigService

  beforeEach(() => {
    jwtService = {
      verifyAsync: vi.fn(),
    } as unknown as JwtService

    configService = {
      get: vi.fn().mockReturnValue('guest_access_secret'),
    } as unknown as ConfigService

    guard = new GuestAccessTokenGuard(jwtService, configService as any)
  })

  it('nen tra ve true khi Bearer token hop le va role la Guest', async () => {
    const payload = {
      userId: 1,
      role: Role.Guest,
      tokenType: TokenType.AccessToken,
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
    }
    vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload)

    const context = createMockContext('Bearer valid.guest.token')
    const result = await guard.canActivate(context)

    expect(result).toBe(true)
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.guest.token', {
      secret: 'guest_access_secret',
    })
  })

  it('nen throw UnauthorizedException khi khong co Authorization header', async () => {
    const context = createMockContext(undefined)
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Kh\u00f4ng nh\u1eadn \u0111\u01b0\u1ee3c access token'
    )
  })

  it('nen throw UnauthorizedException khi Bearer token sai secret', async () => {
    vi.mocked(jwtService.verifyAsync).mockRejectedValue(new Error('invalid signature'))

    const context = createMockContext('Bearer invalid.token')
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })

  it('nen throw UnauthorizedException khi role khong phai Guest', async () => {
    const payload = {
      userId: 10,
      role: Role.Owner,
      tokenType: TokenType.AccessToken,
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
    }
    vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload)

    const context = createMockContext('Bearer owner.token')
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Ch\u1ec9 kh\u00e1ch h\u00e0ng m\u1edbi c\u00f3 quy\u1ec1n truy c\u1eadp'
    )
  })

  it('nen throw UnauthorizedException khi tokenType khong phai AccessToken', async () => {
    const payload = {
      userId: 1,
      role: Role.Guest,
      tokenType: TokenType.RefreshToken,
      exp: Math.floor(Date.now() / 1000) + 900,
      iat: Math.floor(Date.now() / 1000),
    }
    vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload)

    const context = createMockContext('Bearer refresh.token')
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
  })
})
