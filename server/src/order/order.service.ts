import { Injectable } from '@nestjs/common'
import { StatusError } from '../common/index.js'
import { DishStatus, OrderStatus, TableStatus } from '@app/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  CreateOrdersBodyType,
  GetOrdersQueryParamsType,
  PayGuestOrdersBodyType,
  UpdateOrderBodyType,
} from '@app/shared'

/**
 * Tham số cho hàm tạo đơn hàng dùng chung
 */
export interface CreateOrdersForGuestParams {
  guestId: number
  orders: { dishId: number; quantity: number; note?: string }[]
  orderHandlerId: number | null
  /**
   * Nếu true, cho phép tạo đơn kể cả khi bàn ở trạng thái Reserved.
   * Manager (nhân viên) được phép tạo hộ → true.
   * Guest tự đặt → false (bàn Reserved thì chặn).
   */
  allowReservedTable?: boolean
}

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrderList(query: GetOrdersQueryParamsType) {
    const { page, limit, fromDate, toDate } = query
    const skip = (page - 1) * limit

    const where = {
      createdAt: {
        ...(fromDate && { gte: fromDate }),
        ...(toDate && { lte: toDate }),
      },
    }

    const [data, totalItems] = await Promise.all([
      this.prisma.order.findMany({
        include: { dishSnapshot: true, orderHandler: true, guest: true },
        orderBy: { createdAt: 'desc' },
        where,
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      data,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        pageSize: limit,
      },
    }
  }

  async getOrderDetail(orderId: number) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { dishSnapshot: true, orderHandler: true, guest: true, table: true },
    })
  }

  async updateOrder(orderId: number, body: UpdateOrderBodyType & { orderHandlerId: number }) {
    const { status, dishId, quantity, orderHandlerId } = body

    const updatedOrder = await this.prisma.$transaction(async tx => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { dishSnapshot: true },
      })

      let dishSnapshotId = order.dishSnapshotId

      let oldDishSnapshotId: number | null = null

      // Nếu đổi món → tạo snapshot mới
      if (order.dishSnapshot.dishId !== dishId) {
        const dish = await tx.dish.findUniqueOrThrow({ where: { id: dishId } })
        const newSnapshot = await tx.dishSnapshot.create({
          data: {
            description: dish.description,
            image: dish.image,
            name: dish.name,
            price: dish.price,
            dishId: dish.id,
            status: dish.status,
          },
        })
        oldDishSnapshotId = dishSnapshotId
        dishSnapshotId = newSnapshot.id
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status, dishSnapshotId, quantity, orderHandlerId },
        include: { dishSnapshot: true, orderHandler: true, guest: true },
      })

      if (oldDishSnapshotId) {
        await tx.dishSnapshot.delete({ where: { id: oldDishSnapshotId } })
      }

      return updatedOrder
    })

    // Tìm socketId của guest để emit realtime
    const socketRecord = await this.prisma.socket
      .findUnique({ where: { guestId: updatedOrder.guestId! } })
      .catch(() => null)

    return { order: updatedOrder, guestSocketId: socketRecord?.socketId }
  }

  /**
   * Logic dùng chung: tạo đơn hàng cho guest.
   * Được gọi bởi cả OrderController (manager tạo hộ) và GuestController (guest tự đặt).
   *
   * Flow:
   * 1. Validate guest tồn tại + có bàn hợp lệ
   * 2. Validate trạng thái bàn (Hidden → chặn, Reserved → tùy `allowReservedTable`)
   * 3. Validate từng món (Unavailable/Hidden → chặn)
   * 4. Tạo DishSnapshot + Order record trong transaction
   * 5. Tìm socketId của guest để emit realtime
   */
  async createOrdersForGuest(params: CreateOrdersForGuestParams) {
    const { guestId, orders, orderHandlerId, allowReservedTable = true } = params

    // 1. Validate guest
    const guest = await this.prisma.guest.findUniqueOrThrow({ where: { id: guestId } })
    if (guest.tableNumber === null) {
      throw new StatusError({
        message: 'Bàn gắn liền với khách hàng đã bị xóa, vui lòng chọn khách hàng khác!',
        status: 400,
      })
    }

    // 2. Validate table
    const table = await this.prisma.table.findUniqueOrThrow({
      where: { number: guest.tableNumber },
    })
    if (table.status === TableStatus.Hidden) {
      throw new StatusError({
        message: `Bàn ${table.number} đã bị ẩn, vui lòng chọn bàn khác`,
        status: 400,
      })
    }
    if (!allowReservedTable && table.status === TableStatus.Reserved) {
      throw new StatusError({
        message: `Bàn ${table.number} đã được đặt trước, vui lòng đăng xuất và chọn bàn khác`,
        status: 400,
      })
    }

    // 3-4. Transaction: validate dishes + create snapshots + create orders
    const ordersRecord = await this.prisma.$transaction(async tx =>
      Promise.all(
        orders.map(async orderItem => {
          const dish = await tx.dish.findUniqueOrThrow({ where: { id: orderItem.dishId } })
          if (dish.status === DishStatus.Unavailable) {
            throw new StatusError({ message: `Món ${dish.name} đã hết`, status: 400 })
          }
          if (dish.status === DishStatus.Hidden) {
            throw new StatusError({ message: `Món ${dish.name} không thể đặt`, status: 400 })
          }
          const dishSnapshot = await tx.dishSnapshot.create({
            data: {
              description: dish.description,
              image: dish.image,
              name: dish.name,
              price: dish.price,
              dishId: dish.id,
              status: dish.status,
            },
          })
          return tx.order.create({
            data: {
              dishSnapshotId: dishSnapshot.id,
              guestId,
              quantity: orderItem.quantity,
              note: orderItem.note?.trim() || null,
              tableNumber: guest.tableNumber,
              orderHandlerId,
              status: OrderStatus.Pending,
            },
            include: { dishSnapshot: true, guest: true, orderHandler: true },
          })
        })
      )
    )

    // 5. Tìm socketId của guest để emit realtime
    const socketRecord = await this.prisma.socket
      .findUnique({ where: { guestId } })
      .catch(() => null)

    return { orders: ordersRecord, guestSocketId: socketRecord?.socketId }
  }

  /**
   * Manager tạo đơn hàng cho khách (delegate sang createOrdersForGuest)
   */
  async createOrders(orderHandlerId: number, body: CreateOrdersBodyType) {
    return this.createOrdersForGuest({
      guestId: body.guestId,
      orders: body.orders,
      orderHandlerId,
      allowReservedTable: true, // Manager được phép tạo đơn cho bàn Reserved
    })
  }

  async payGuestOrders(body: PayGuestOrdersBodyType & { orderHandlerId: number }) {
    const { guestId, orderHandlerId } = body

    const pendingOrders = await this.prisma.order.findMany({
      where: {
        guestId,
        status: { in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered] },
      },
      include: { dishSnapshot: true },
    })

    if (pendingOrders.length === 0) {
      throw new StatusError({ message: 'Không có hóa đơn nào cần thanh toán', status: 400 })
    }

    // Tính tổng tiền
    const totalAmount = pendingOrders.reduce((sum, o) => sum + o.dishSnapshot.price * o.quantity, 0)

    // Sinh orderCode cho Bill
    const orderCode =
      Number(String(Date.now()).slice(-6)) * 10000 + Math.floor(1000 + Math.random() * 9000)

    const orderIds = pendingOrders.map(o => o.id)

    await this.prisma.$transaction(async tx => {
      // Hủy bill Pending cũ của khách nếu có (ví dụ khách bấm tạo VietQR trước đó nhưng đổi ý trả tiền mặt)
      await tx.bill.updateMany({
        where: { guestId, status: 'Pending' },
        data: { status: 'Cancelled' },
      })

      // Tạo Bill (thanh toán tiền mặt → status Paid ngay)
      const bill = await tx.bill.create({
        data: {
          orderCode,
          guestId,
          tableNumber: pendingOrders[0]?.tableNumber ?? null,
          orderHandlerId,
          totalAmount,
          status: OrderStatus.Paid,
          paymentMethod: 'Cash',
        },
      })

      // Cập nhật các Order → Paid + gán billId
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: OrderStatus.Paid, orderHandlerId, billId: bill.id },
      })
    })

    // Rotate token QR bàn sau thanh toán — token cũ vô hiệu hóa
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } })
    let tokenRotation: { tableNumber: number; newToken: string } | null = null
    if (guest?.tableNumber) {
      const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
      await this.prisma.table.update({
        where: { number: guest.tableNumber },
        data: { token: newToken },
      })
      tokenRotation = { tableNumber: guest.tableNumber, newToken }
    }

    const [paidOrders, socketRecord] = await Promise.all([
      this.prisma.order.findMany({
        where: { id: { in: orderIds } },
        include: { dishSnapshot: true, orderHandler: true, guest: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.socket.findUnique({ where: { guestId } }).catch(() => null),
    ])

    return { orders: paidOrders, guestSocketId: socketRecord?.socketId, tokenRotation }
  }
}
