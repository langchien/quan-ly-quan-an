import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Webhook } from '@payos/node'
import { StatusError } from '../common/index.js'
import { BillStatus, OrderStatus, PaymentMethod } from '@app/shared'
import type { EnvType } from '../config/env.config.js'
import { PayosService } from '../payos/payos.service.js'
import { PrismaService } from '../prisma/prisma.service.js'

/** Mã PayOS báo giao dịch thành công */
const PAYOS_SUCCESS_CODE = '00'

@Injectable()
export class BillService {
  private readonly logger = new Logger(BillService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayosService,
    private readonly configService: ConfigService<EnvType, true>
  ) {}

  /**
   * Sinh orderCode duy nhất cho PayOS.
   * PayOS yêu cầu orderCode là số nguyên dương từ 1 → 9007199254740991.
   * Format: lấy 6 chữ số cuối timestamp + 4 chữ số random → 10 chữ số.
   */
  private generateOrderCode(): number {
    const timestamp = Number(String(Date.now()).slice(-6))
    const random = Math.floor(1000 + Math.random() * 9000)
    return timestamp * 10000 + random
  }

  /**
   * Tạo Payment Link cho khách thanh toán qua PayOS (VietQR).
   *
   * Flow:
   * 1. Tìm các Order chưa thanh toán (Pending/Processing/Delivered) của guest
   * 2. Tạo bản ghi Bill (status: Pending) và gán billId cho các Order
   * 3. Gọi PayOS API tạo Payment Link
   * 4. Cập nhật thông tin PayOS vào Bill
   * 5. Trả về billId + checkoutUrl + qrCode cho Frontend
   */
  async createPaymentLink(guestId: number) {
    // 0. Kiểm tra nếu đã có Bill Pending trước đó của guest
    const existingPendingBill = await this.prisma.bill.findFirst({
      where: {
        guestId,
        status: BillStatus.Pending,
      },
      include: {
        orders: {
          include: { dishSnapshot: true },
        },
      },
    })

    if (existingPendingBill) {
      // Kiểm tra có món mới gọi chưa thuộc bill này không
      const newOrders = await this.prisma.order.findMany({
        where: {
          guestId,
          status: { in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered] },
          billId: null,
        },
      })

      // Nếu không có món mới và bill cũ đã có QR link hợp lệ -> tái sử dụng ngay
      if (newOrders.length === 0 && existingPendingBill.checkoutUrl && existingPendingBill.qrCode) {
        return {
          billId: existingPendingBill.id,
          checkoutUrl: existingPendingBill.checkoutUrl,
          qrCode: existingPendingBill.qrCode,
          orderCode: Number(existingPendingBill.orderCode),
        }
      }

      // Nếu có món mới: hủy link PayOS cũ trước (để QR cũ không thể thanh toán được nữa),
      // sau đó hủy bill cũ và gỡ liên kết để tạo bill mới gom tất cả
      if (existingPendingBill.paymentLinkId) {
        await this.payosService.cancelPaymentLink(
          Number(existingPendingBill.orderCode),
          'Khach goi them mon'
        )
      }

      await this.prisma.$transaction([
        this.prisma.order.updateMany({
          where: { billId: existingPendingBill.id },
          data: { billId: null },
        }),
        this.prisma.bill.update({
          where: { id: existingPendingBill.id },
          data: { status: BillStatus.Cancelled },
        }),
      ])
    }

    // 1. Tìm các Order chưa thanh toán & chưa thuộc Bill nào
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        guestId,
        status: { in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered] },
        billId: null, // Chưa gán vào bill nào
      },
      include: { dishSnapshot: true },
    })

    if (pendingOrders.length === 0) {
      throw new StatusError({ message: 'Không có đơn hàng nào cần thanh toán', status: 400 })
    }

    // Tính tổng tiền
    const totalAmount = pendingOrders.reduce((sum, o) => sum + o.dishSnapshot.price * o.quantity, 0)

    // Lấy thông tin guest
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } })

    // 2. Tạo Bill + gán billId cho các Order trong transaction
    const orderCode = this.generateOrderCode()
    const orderIds = pendingOrders.map(o => o.id)

    const items = pendingOrders.map(o => ({
      name: o.dishSnapshot.name,
      quantity: o.quantity,
      price: o.dishSnapshot.price,
    }))

    const description = (
      guest?.tableNumber != null ? `Ban ${guest.tableNumber} DH${orderCode}` : `DH ${orderCode}`
    ).slice(0, 25)

    const bill = await this.prisma.$transaction(async tx => {
      const newBill = await tx.bill.create({
        data: {
          orderCode,
          guestId,
          tableNumber: guest?.tableNumber ?? null,
          totalAmount,
          status: BillStatus.Pending,
          paymentMethod: PaymentMethod.PayOS,
        },
      })

      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { billId: newBill.id },
      })

      return newBill
    })

    // 3. Gọi PayOS tạo Payment Link — lỗi thì rollback (compensating action)
    let paymentResult: Awaited<ReturnType<PayosService['createPaymentLink']>>
    try {
      paymentResult = await this.payosService.createPaymentLink({
        orderCode,
        amount: totalAmount,
        description,
        items,
        returnUrl: this.configService.get('PAYOS_RETURN_URL', { infer: true }),
        cancelUrl: this.configService.get('PAYOS_CANCEL_URL', { infer: true }),
      })
    } catch (error) {
      this.logger.error(
        `❌ Tạo Payment Link thất bại (billId=${bill.id}, orderCode=${orderCode}): ${(error as Error).message}`
      )
      await this.prisma.$transaction([
        this.prisma.order.updateMany({ where: { billId: bill.id }, data: { billId: null } }),
        this.prisma.bill.update({
          where: { id: bill.id },
          data: { status: BillStatus.Cancelled },
        }),
      ])
      throw new StatusError({
        message: 'Không tạo được mã thanh toán, vui lòng thử lại',
        status: 502,
      })
    }

    // 4. Cập nhật thông tin PayOS vào Bill
    await this.prisma.bill.update({
      where: { id: bill.id },
      data: {
        paymentLinkId: paymentResult.paymentLinkId,
        checkoutUrl: paymentResult.checkoutUrl,
        qrCode: paymentResult.qrCode,
      },
    })

    this.logger.log(
      `💳 Payment Link created: billId=${bill.id}, orderCode=${orderCode}, amount=${totalAmount}`
    )

    return {
      billId: bill.id,
      checkoutUrl: paymentResult.checkoutUrl,
      qrCode: paymentResult.qrCode,
      orderCode,
    }
  }

  /**
   * Xử lý webhook từ PayOS khi có giao dịch.
   *
   * Flow:
   * 1. Verify chữ ký số từ PayOS
   * 2. Chỉ xử lý giao dịch thành công (code = '00')
   * 3. Tìm Bill theo orderCode, kiểm tra trạng thái Pending
   * 4. Đối chiếu số tiền với Bill.totalAmount
   * 5. Hoàn tất thanh toán (idempotent)
   */
  async handleWebhook(webhookBody: Webhook) {
    // 1. Verify chữ ký
    const data = await this.payosService.verifyWebhookData(webhookBody)

    if (!data || !data.orderCode) {
      this.logger.warn('⚠️ Webhook data không hợp lệ')
      return null
    }

    const { orderCode, amount } = data

    // 2. Chỉ chốt khi giao dịch thành công (data đã được ký nên dùng data.code)
    if (data.code !== PAYOS_SUCCESS_CODE) {
      this.logger.warn(`⚠️ Webhook orderCode=${orderCode} không thành công (code=${data.code})`)
      return null
    }

    // 3. Tìm Bill
    const bill = await this.prisma.bill.findUnique({
      where: { orderCode: BigInt(orderCode) },
    })

    if (!bill) {
      // Bao gồm cả webhook kiểm tra khi đăng ký URL trên dashboard PayOS
      this.logger.warn(`⚠️ Không tìm thấy Bill với orderCode=${orderCode}`)
      return null
    }

    if (bill.status === BillStatus.Paid) {
      this.logger.log(`ℹ️ Bill #${bill.id} đã thanh toán trước đó, bỏ qua webhook`)
      return null
    }

    if (bill.status !== BillStatus.Pending) {
      this.logger.error(
        `💸 Nhận ${amount}đ cho Bill #${bill.id} đang ở trạng thái ${bill.status} ` +
          `(orderCode=${orderCode}, ref=${data.reference}) — cần đối soát/hoàn tiền thủ công`
      )
      return null
    }

    // 4. Đối chiếu số tiền
    if (amount !== bill.totalAmount) {
      this.logger.error(
        `💸 Sai số tiền Bill #${bill.id}: nhận ${amount}đ, cần ${bill.totalAmount}đ ` +
          `(orderCode=${orderCode}, ref=${data.reference}) — cần đối soát thủ công`
      )
      return null
    }

    // 5. Cập nhật Bill + Order + Rotate token trong transaction
    return this.completeBillPayment(bill.id)
  }

  /**
   * Hoàn tất thanh toán Bill (idempotent).
   *
   * Flow:
   * 1. Chuyển Bill Pending → Paid bằng UPDATE có điều kiện (chỉ một request thắng)
   * 2. Cập nhật tất cả Order trong Bill → Paid
   * 3. Rotate token QR bàn (vô hiệu hóa mã QR cũ)
   * 4. Trả về thông tin để emit Socket, hoặc null nếu đã được xử lý trước đó
   */
  private async completeBillPayment(billId: number) {
    const result = await this.prisma.$transaction(async tx => {
      // Chỉ chuyển trạng thái nếu Bill vẫn còn Pending — chống webhook trùng/đồng thời
      const { count } = await tx.bill.updateMany({
        where: { id: billId, status: BillStatus.Pending },
        data: { status: BillStatus.Paid },
      })
      if (count === 0) return null

      const updatedBill = await tx.bill.findUniqueOrThrow({
        where: { id: billId },
        include: { orders: true },
      })

      // Cập nhật tất cả Order thuộc Bill
      const orderIds = updatedBill.orders.map(o => o.id)
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: OrderStatus.Paid },
      })

      // Rotate token QR bàn
      let tokenRotation: { tableNumber: number; newToken: string } | null = null
      if (updatedBill.tableNumber) {
        const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
        await tx.table.update({
          where: { number: updatedBill.tableNumber },
          data: { token: newToken },
        })
        tokenRotation = { tableNumber: updatedBill.tableNumber, newToken }
      }

      return { bill: updatedBill, orderIds, tokenRotation }
    })

    if (!result) {
      this.logger.log(`ℹ️ Bill #${billId} đã được xử lý bởi request khác, bỏ qua`)
      return null
    }

    // Lấy orders đầy đủ relation (bên ngoài transaction để tránh lock)
    const [paidOrders, socketRecord] = await Promise.all([
      this.prisma.order.findMany({
        where: { id: { in: result.orderIds } },
        include: { dishSnapshot: true, orderHandler: true, guest: true },
        orderBy: { createdAt: 'desc' },
      }),
      result.bill.guestId
        ? this.prisma.socket
            .findUnique({ where: { guestId: result.bill.guestId } })
            .catch(() => null)
        : null,
    ])

    this.logger.log(`✅ Bill #${billId} thanh toán thành công — ${paidOrders.length} đơn`)

    return {
      orders: paidOrders,
      guestSocketId: socketRecord?.socketId,
      tokenRotation: result.tokenRotation,
    }
  }

  /**
   * Lịch sử hóa đơn đã thanh toán của guest đang đăng nhập (mới nhất trước).
   * Chỉ trả Bill Paid — bill Pending/Cancelled là trạng thái trung gian, không hiển thị.
   */
  async getGuestBills(guestId: number) {
    const bills = await this.prisma.bill.findMany({
      where: { guestId, status: BillStatus.Paid },
      include: {
        orders: {
          include: { dishSnapshot: true, orderHandler: true, guest: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Chuyển BigInt sang Number cho response JSON
    return bills.map(bill => ({ ...bill, orderCode: Number(bill.orderCode) }))
  }

  /**
   * Lấy chi tiết hóa đơn kèm danh sách món.
   * Chỉ trả về hóa đơn thuộc về guest đang đăng nhập (chống IDOR).
   */
  async getBillDetail(billId: number, guestId: number) {
    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, guestId },
      include: {
        orders: {
          include: { dishSnapshot: true, orderHandler: true, guest: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!bill) {
      throw new StatusError({ message: 'Không tìm thấy hóa đơn', status: 404 })
    }

    // Chuyển BigInt sang Number cho response JSON
    return {
      ...bill,
      orderCode: Number(bill.orderCode),
    }
  }
}
