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
} from './dto/guest.schema.js'
import { EventsGateway } from '../events/events.gateway.js'

@Controller('guest')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private readonly eventsGateway: EventsGateway
  ) {}

  /**
   * POST /guest/auth/login
   * Đăng nhập khách hàng (quét mã QR bàn)
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@ZodBody(GuestLoginBody) body: GuestLoginBodyType) {
    const result = await this.guestService.login(body)
    return {
      message: 'Đăng nhập thành công',
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
   * Đăng xuất khách hàng (yêu cầu GuestAccessToken)
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
   * Làm mới access token
   */
  @Post('auth/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@ZodBody(GuestRefreshTokenBody) body: GuestRefreshTokenBodyType) {
    const result = await this.guestService.refreshToken(body)
    return { message: 'Lấy token mới thành công', data: result }
  }

  /**
   * GET /guest/orders
   * Xem danh sách đơn hàng của khách
   */
  @Get('orders')
  @UseGuards(GuestAccessTokenGuard)
  async getOrders(@ActiveUser('userId') guestId: number) {
    const orders = await this.guestService.getOrders(guestId)
    return { message: 'Lấy danh sách đơn hàng thành công', data: orders }
  }

  /**
   * POST /guest/orders
   * Đặt món (tạo đơn hàng), emit socket new-order
   */
  @Post('orders')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GuestAccessTokenGuard)
  async createOrders(
    @ActiveUser('userId') guestId: number,
    @ZodBody(GuestCreateOrdersBody) body: GuestCreateOrdersBodyType
  ) {
    const { orders, guestSocketId } = await this.guestService.createOrders(guestId, body)

    // Emit realtime tới manager room (+ guest socket nếu có)
    this.eventsGateway.emitNewOrder(orders, guestSocketId)

    return { message: 'Đặt món thành công', data: orders }
  }
}
