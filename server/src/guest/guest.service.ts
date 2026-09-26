import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, type JwtSignOptions } from '@nestjs/jwt'
import { StatusError } from '../common/index.js'
import type { EnvType } from '../config/env.config.js'
import { Role, TableStatus, TokenType } from '../constants/type.js'
import { OrderService } from '../order/order.service.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  GuestCreateOrdersBodyType,
  GuestLoginBodyType,
  GuestRefreshTokenBodyType,
} from './dto/guest.schema.js'

@Injectable()
export class GuestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly orderService: OrderService
  ) {}

  private signGuestAccessToken(userId: number) {
    return this.jwtService.sign(
      { userId, role: Role.Guest, tokenType: TokenType.AccessToken },
      {
        secret: this.configService.get('GUEST_ACCESS_TOKEN_SECRET', { infer: true }),
        expiresIn: this.configService.get('GUEST_ACCESS_TOKEN_EXPIRES_IN', {
          infer: true,
        }) as JwtSignOptions['expiresIn'],
      }
    )
  }

  private signGuestRefreshToken(userId: number, exp?: number) {
    const payload = { userId, role: Role.Guest, tokenType: TokenType.RefreshToken }
    if (exp) {
      return this.jwtService.sign(
        { ...payload, exp },
        { secret: this.configService.get('GUEST_REFRESH_TOKEN_SECRET', { infer: true }) }
      )
    }
    return this.jwtService.sign(payload, {
      secret: this.configService.get('GUEST_REFRESH_TOKEN_SECRET', { infer: true }),
      expiresIn: this.configService.get('GUEST_REFRESH_TOKEN_EXPIRES_IN', {
        infer: true,
      }) as JwtSignOptions['expiresIn'],
    })
  }

  private verifyGuestRefreshToken(token: string) {
    try {
      return this.jwtService.verify<{ userId: number; role: string; exp: number }>(token, {
        secret: this.configService.get('GUEST_REFRESH_TOKEN_SECRET', { infer: true }),
      })
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ')
    }
  }

  async login(body: GuestLoginBodyType) {
    const table = await this.prisma.table.findUnique({
      where: { number: body.tableNumber, token: body.token },
    })

    if (!table) {
      throw new StatusError({
        message: 'Bàn không tồn tại hoặc mã token không đúng',
        status: 401,
      })
    }
    if (table.status === TableStatus.Hidden) {
      throw new StatusError({
        message: 'Bàn này đã bị ẩn, hãy chọn bàn khác để đăng nhập',
        status: 400,
      })
    }
    if (table.status === TableStatus.Reserved) {
      throw new StatusError({
        message: 'Bàn đã được đặt trước, hãy liên hệ nhân viên để được hỗ trợ',
        status: 400,
      })
    }

    let guest = await this.prisma.guest.create({
      data: { name: body.name, tableNumber: body.tableNumber },
    })

    const refreshToken = this.signGuestRefreshToken(guest.id)
    const accessToken = this.signGuestAccessToken(guest.id)

    const decoded = this.verifyGuestRefreshToken(refreshToken)
    const refreshTokenExpiresAt = new Date(decoded.exp * 1000)

    guest = await this.prisma.guest.update({
      where: { id: guest.id },
      data: { refreshToken, refreshTokenExpiresAt },
    })

    return { guest, accessToken, refreshToken }
  }

  async logout(guestId: number) {
    await this.prisma.guest.update({
      where: { id: guestId },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    })
    return 'Đăng xuất thành công'
  }

  async refreshToken(body: GuestRefreshTokenBodyType) {
    const decoded = this.verifyGuestRefreshToken(body.refreshToken)

    // Kiểm tra refresh token còn hợp lệ trong DB không
    const guest = await this.prisma.guest.findUnique({
      where: { id: decoded.userId },
    })
    if (!guest || guest.refreshToken !== body.refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã bị thu hồi')
    }

    const newRefreshToken = this.signGuestRefreshToken(decoded.userId, decoded.exp)
    const newAccessToken = this.signGuestAccessToken(decoded.userId)

    await this.prisma.guest.update({
      where: { id: decoded.userId },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: new Date(decoded.exp * 1000),
      },
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  async getOrders(guestId: number) {
    return this.prisma.order.findMany({
      where: { guestId },
      include: { dishSnapshot: true, orderHandler: true, guest: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Guest tự đặt món — delegate sang OrderService.createOrdersForGuest()
   * với allowReservedTable=false (khách không được đặt vào bàn Reserved)
   */
  async createOrders(guestId: number, body: GuestCreateOrdersBodyType) {
    return this.orderService.createOrdersForGuest({
      guestId,
      orders: body,
      orderHandlerId: null, // Khách tự đặt → không có nhân viên xử lý
      allowReservedTable: false, // Khách không được đặt vào bàn đã được đặt trước
    })
  }
}
