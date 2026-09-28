import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { OrderStatus, TableStatus } from '@app/shared'
import type { DashboardIndicatorQueryParamsType } from '@app/shared'
import { format, eachDayOfInterval } from 'date-fns'

@Injectable()
export class IndicatorService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardIndicator(query: DashboardIndicatorQueryParamsType) {
    const { fromDate, toDate } = query

    // 1. Lấy tất cả orders đã thanh toán (Paid) trong khoảng thời gian
    const paidOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.Paid,
        createdAt: { gte: fromDate, lte: toDate },
      },
      include: { dishSnapshot: true },
    })

    // 2. Tính tổng doanh thu
    const revenue = paidOrders.reduce(
      (sum, order) => sum + order.dishSnapshot.price * order.quantity,
      0
    )

    // 3. Đếm số khách (distinct guestId)
    const guestIds = new Set(paidOrders.map(o => o.guestId).filter(Boolean))
    const guestCount = guestIds.size

    // 4. Đếm số đơn hàng đã thanh toán
    const orderCount = paidOrders.length

    // 5. Đếm bàn đang phục vụ (status = Reserved)
    const servingTableCount = await this.prisma.table.count({
      where: { status: TableStatus.Reserved },
    })

    // 6. Thống kê món ăn (group by dishId, sum quantity)
    const dishMap = new Map<number, { successOrders: number }>()

    for (const order of paidOrders) {
      const dishId = order.dishSnapshot.dishId
      if (dishId === null) continue
      const existing = dishMap.get(dishId)
      if (existing) {
        existing.successOrders += order.quantity
      } else {
        dishMap.set(dishId, { successOrders: order.quantity })
      }
    }

    // Lấy thông tin dish gốc
    const dishIds = Array.from(dishMap.keys())
    const dishes =
      dishIds.length > 0
        ? await this.prisma.dish.findMany({
            where: { id: { in: dishIds } },
          })
        : []

    const dishIndicator = dishes
      .map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        image: dish.image,
        status: dish.status,
        createdAt: dish.createdAt,
        updatedAt: dish.updatedAt,
        successOrders: dishMap.get(dish.id)?.successOrders ?? 0,
      }))
      .sort((a, b) => b.successOrders - a.successOrders)

    // 7. Doanh thu theo ngày
    const allDays = eachDayOfInterval({ start: fromDate, end: toDate })
    const revenueMap = new Map<string, number>()

    // Khởi tạo tất cả các ngày với revenue = 0
    for (const day of allDays) {
      revenueMap.set(format(day, 'dd/MM/yyyy'), 0)
    }

    // Cộng dồn revenue từ orders
    for (const order of paidOrders) {
      const dateKey = format(order.createdAt, 'dd/MM/yyyy')
      const existing = revenueMap.get(dateKey) ?? 0
      revenueMap.set(dateKey, existing + order.dishSnapshot.price * order.quantity)
    }

    const revenueByDate = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }))

    return {
      revenue,
      guestCount,
      orderCount,
      servingTableCount,
      dishIndicator,
      revenueByDate,
    }
  }
}
