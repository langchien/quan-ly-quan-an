import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { PayOS, Webhook, WebhookData } from '@payos/node'
import type { EnvType } from '../config/env.config.js'

/**
 * Kết quả trả về khi tạo Payment Link.
 */
export interface CreatePaymentLinkResult {
  paymentLinkId: string
  checkoutUrl: string
  qrCode: string
}

/**
 * Tham số đầu vào để tạo Payment Link.
 */
export interface CreatePaymentLinkParams {
  orderCode: number
  amount: number
  description: string
  items: { name: string; quantity: number; price: number }[]
  returnUrl: string
  cancelUrl: string
}

@Injectable()
export class PayosService implements OnModuleInit {
  private readonly logger = new Logger(PayosService.name)
  private payos!: PayOS

  constructor(private readonly configService: ConfigService<EnvType, true>) {}

  /**
   * Khởi tạo SDK khi module khởi động (được Nest await).
   * Lỗi khởi tạo sẽ làm app dừng — không fallback sang chế độ giả lập.
   */
  async onModuleInit() {
    const { PayOS } = await import('@payos/node')
    this.payos = new PayOS({
      clientId: this.configService.get('PAYOS_CLIENT_ID', { infer: true }),
      apiKey: this.configService.get('PAYOS_API_KEY', { infer: true }),
      checksumKey: this.configService.get('PAYOS_CHECKSUM_KEY', { infer: true }),
    })
    this.logger.log('✅ PayOS đã khởi tạo thành công')
  }

  /**
   * Tạo Payment Link trên PayOS.
   */
  async createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResult> {
    const paymentData = await this.payos.paymentRequests.create({
      orderCode: params.orderCode,
      amount: params.amount,
      description: params.description.slice(0, 25),
      items: params.items,
      returnUrl: params.returnUrl,
      cancelUrl: params.cancelUrl,
    })

    return {
      paymentLinkId: paymentData.paymentLinkId,
      checkoutUrl: paymentData.checkoutUrl,
      qrCode: paymentData.qrCode,
    }
  }

  /**
   * Hủy Payment Link trên PayOS để mã QR cũ không thể thanh toán được nữa.
   * Không ném lỗi (link có thể đã hết hạn/đã hủy) — chỉ log cảnh báo.
   */
  async cancelPaymentLink(orderCode: number, reason: string): Promise<void> {
    try {
      await this.payos.paymentRequests.cancel(orderCode, reason)
      this.logger.log(`🚫 Đã hủy Payment Link orderCode=${orderCode}`)
    } catch (error) {
      this.logger.warn(
        `⚠️ Không hủy được Payment Link orderCode=${orderCode}: ${(error as Error).message}`
      )
    }
  }

  /**
   * Xác thực dữ liệu webhook từ PayOS (verify chữ ký số).
   * Trả về dữ liệu đã xác thực hoặc null nếu chữ ký sai / payload lỗi.
   */
  async verifyWebhookData(webhookBody: Webhook): Promise<WebhookData | null> {
    try {
      return await this.payos.webhooks.verify(webhookBody)
    } catch (error) {
      this.logger.warn(`⚠️ Xác thực webhook thất bại: ${(error as Error).message}`)
      return null
    }
  }
}
