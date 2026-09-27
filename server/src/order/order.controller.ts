import { Controller, Get, Post, Put, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common'
import { OrderService } from './order.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { ActiveUser } from '../auth/decorators/active-user.decorator.js'
import { ZodBody, ZodParam, ZodQuery } from '../common/index.js'
import { Role } from '../constants/type.js'
import {
  OrderParam,
  type OrderParamType,
  GetOrdersQueryParams,
  type GetOrdersQueryParamsType,
  UpdateOrderBody,
  type UpdateOrderBodyType,
  CreateOrdersBody,
  type CreateOrdersBodyType,
  PayGuestOrdersBody,
  type PayGuestOrdersBodyType,
} from './dto/order.schema.js'
import { EventsGateway } from '../events/events.gateway.js'

@Controller('orders')
@UseGuards(AccessTokenGuard, RolesGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly eventsGateway: EventsGateway
  ) {}

  /**
   * POST /orders
   * Manager tạo đơn hàng cho khách
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createOrders(
    @ActiveUser('userId') accountId: number,
    @ZodBody(CreateOrdersBody) body: CreateOrdersBodyType
  ) {
    const { orders, guestSocketId } = await this.orderService.createOrders(accountId, body)
    this.eventsGateway.emitNewOrder(orders, guestSocketId)
    return {
      message: `Tạo thành công ${orders.length} đơn hàng cho khách hàng`,
      data: orders,
    }
  }

  /**
   * GET /orders
   * Lấy danh sách đơn hàng (có thể filter theo ngày)
   */
  @Get()
  async getOrderList(@ZodQuery(GetOrdersQueryParams) query: GetOrdersQueryParamsType) {
    const orders = await this.orderService.getOrderList(query)
    return { message: 'Lấy danh sách đơn hàng thành công', data: orders }
  }

  /**
   * GET /orders/:orderId
   * Lấy chi tiết đơn hàng
   */
  @Get(':orderId')
  async getOrderDetail(@ZodParam(OrderParam) params: OrderParamType) {
    const order = await this.orderService.getOrderDetail(params.orderId)
    return { message: 'Lấy đơn hàng thành công', data: order }
  }

  /**
   * PUT /orders/:orderId
   * Cập nhật trạng thái đơn hàng, emit socket update-order
   */
  @Put(':orderId')
  async updateOrder(
    @ZodParam(OrderParam) params: OrderParamType,
    @ZodBody(UpdateOrderBody) body: UpdateOrderBodyType,
    @ActiveUser('userId') accountId: number
  ) {
    const { order, guestSocketId } = await this.orderService.updateOrder(params.orderId, {
      ...body,
      orderHandlerId: accountId,
    })
    this.eventsGateway.emitUpdateOrder(order, guestSocketId)
    return { message: 'Cập nhật đơn hàng thành công', data: order }
  }

  /**
   * POST /orders/pay
   * Thanh toán toàn bộ đơn hàng của guest — chỉ Owner
   */
  @Post('pay')
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  async payGuestOrders(
    @ZodBody(PayGuestOrdersBody) body: PayGuestOrdersBodyType,
    @ActiveUser('userId') accountId: number
  ) {
    const { orders, guestSocketId, tokenRotation } = await this.orderService.payGuestOrders({
      ...body,
      orderHandlerId: accountId,
    })
    this.eventsGateway.emitPayment(orders, guestSocketId)

    // Nếu token QR bàn đã được rotate → thông báo manager để cập nhật QR code
    if (tokenRotation) {
      this.eventsGateway.emitTableTokenRotated(tokenRotation)
    }

    return {
      message: `Thanh toán thành công ${orders.length} đơn`,
      data: orders,
    }
  }
}
