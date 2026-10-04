import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common'
import type { Webhook } from '@payos/node'
import { BillService } from './bill.service.js'
import { GuestAccessTokenGuard } from '../auth/guards/guest-access-token.guard.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { ActiveUser } from '../auth/decorators/active-user.decorator.js'
import { ZodBody } from '../common/index.js'
import { Role } from '@app/shared'
import { CreatePaymentLinkBody, type CreatePaymentLinkBodyType } from '@app/shared'
import { EventsGateway } from '../events/events.gateway.js'

@Controller('bill')
export class BillController {
  constructor(
    private readonly billService: BillService,
    private readonly eventsGateway: EventsGateway
  ) {}

  /**
   * POST /bill/create-payment-link
   * Guest tạo hóa đơn và lấy mã QR VietQR để thanh toán.
   */
  @Post('create-payment-link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(GuestAccessTokenGuard)
  async createPaymentLink(@ActiveUser('userId') guestId: number) {
    const result = await this.billService.createPaymentLink(guestId)
    return {
      message: 'Tạo mã thanh toán thành công',
      data: result,
    }
  }

  /**
   * POST /bill/manager/create-payment-link
   * Thu ngân/Quản lý tạo mã VietQR cho khách tại quầy.
   */
  @Post('manager/create-payment-link')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.Owner, Role.Employee])
  async createPaymentLinkForGuest(@ZodBody(CreatePaymentLinkBody) body: CreatePaymentLinkBodyType) {
    const result = await this.billService.createPaymentLink(body.guestId)
    return {
      message: 'Tạo mã thanh toán thành công',
      data: result,
    }
  }

  /**
   * POST /bill/webhook/payos
   * Webhook endpoint cho PayOS gọi khi có tiền về.
   * Không cần auth guard — xác thực bằng chữ ký số PayOS (checksum).
   */
  @Post('webhook/payos')
  @HttpCode(HttpStatus.OK)
  async handlePayOSWebhook(@Body() body: Webhook) {
    const result = await this.billService.handleWebhook(body)

    if (result) {
      // Emit socket events cho cả Manager và Guest
      this.eventsGateway.emitPayment(result.orders, result.guestSocketId)
      if (result.tokenRotation) {
        this.eventsGateway.emitTableTokenRotated(result.tokenRotation)
      }
    }

    return { message: 'Webhook received' }
  }

  /**
   * GET /bill/history
   * Guest xem lịch sử hóa đơn đã thanh toán của chính mình.
   * Lưu ý: phải khai báo TRƯỚC route ':billId'.
   */
  @Get('history')
  @UseGuards(GuestAccessTokenGuard)
  async getGuestBills(@ActiveUser('userId') guestId: number) {
    const bills = await this.billService.getGuestBills(guestId)
    return { message: 'Lấy lịch sử hóa đơn thành công', data: bills }
  }

  /**
   * GET /bill/:billId
   * Guest xem chi tiết hóa đơn của chính mình.
   */
  @Get(':billId')
  @UseGuards(GuestAccessTokenGuard)
  async getBillDetail(
    @Param('billId', ParseIntPipe) billId: number,
    @ActiveUser('userId') guestId: number
  ) {
    const bill = await this.billService.getBillDetail(billId, guestId)
    return { message: 'Lấy hóa đơn thành công', data: bill }
  }
}
