import { Controller, Get, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { GuestService } from './guest.service.js'
import { GuestAccessTokenGuard } from '../auth/guards/guest-access-token.guard.js'
import { ActiveUser } from '../auth/decorators/active-user.decorator.js'
import { ZodBody } from '../common/index.js'
import {
  GuestLoginBody,
  type GuestLoginBodyType,
  GuestLogoutBody,
  type GuestLogoutBodyType,
  GuestRefreshTokenBody,
  type GuestRefreshTokenBodyType,
  GuestCreateOrdersBody,
  type GuestCreateOrdersBodyType,
} from '@app/shared'
import { EventsGateway } from '../events/events.gateway.js'

@Controller('guest')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private readonly eventsGateway: EventsGateway
  ) {}

  /**
   * POST /guest/auth/login
   * �ang nh?p kh�ch h�ng (qu�t m� QR b�n)
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@ZodBody(GuestLoginBody) body: GuestLoginBodyType) {
    const result = await this.guestService.login(body)
    return {
      message: '�ang nh?p th�nh c�ng',
      data: {
        guest: {
          id: result.guest.id,
          name: result.guest.name,
          role: 'Guest',
          tableNumber: result.guest.tableNumber,
          createdAt: result.guest.createdAt,
          updatedAt: result.guest.updatedAt,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    }
  }

  /**
   * POST /guest/auth/logout
   * �ang xu?t kh�ch h�ng (y�u c?u GuestAccessToken)
   */
  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GuestAccessTokenGuard)
  async logout(
    @ActiveUser('userId') guestId: number,
    @ZodBody(GuestLogoutBody) _body: GuestLogoutBodyType
  ) {
    const message = await this.guestService.logout(guestId)
    return { message }
  }

  /**
   * POST /guest/auth/refresh-token
   * L�m m?i access token
   */
  @Post('auth/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@ZodBody(GuestRefreshTokenBody) body: GuestRefreshTokenBodyType) {
    const result = await this.guestService.refreshToken(body)
    return { message: 'L?y token m?i th�nh c�ng', data: result }
  }

  /**
   * GET /guest/orders
   * Xem danh s�ch don h�ng c?a kh�ch
   */
  @Get('orders')
  @UseGuards(GuestAccessTokenGuard)
  async getOrders(@ActiveUser('userId') guestId: number) {
    const orders = await this.guestService.getOrders(guestId)
    return { message: 'L?y danh s�ch don h�ng th�nh c�ng', data: orders }
  }

  /**
   * POST /guest/orders
   * �?t m�n (t?o don h�ng), emit socket new-order
   */
  @Post('orders')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GuestAccessTokenGuard)
  async createOrders(
    @ActiveUser('userId') guestId: number,
    @ZodBody(GuestCreateOrdersBody) body: GuestCreateOrdersBodyType
  ) {
    const { orders, guestSocketId } = await this.guestService.createOrders(guestId, body)

    // Emit realtime t?i manager room (+ guest socket n?u c�)
    this.eventsGateway.emitNewOrder(orders, guestSocketId)

    return { message: '�?t m�n th�nh c�ng', data: orders }
  }
}
