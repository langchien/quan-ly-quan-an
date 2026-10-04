import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { EventsGateway } from '../events/events.gateway.js'
import type { CreateDishBodyType, UpdateDishBodyType, UpdateDishStatusBodyType } from '@app/shared'

@Injectable()
export class DishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway
  ) {}

  /**
   * Lấy danh sách tất cả món ăn
   */
  getDishList() {
    return this.prisma.dish.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Lấy chi tiết một món ăn theo id
   */
  getDishDetail(id: number) {
    return this.prisma.dish.findUniqueOrThrow({
      where: { id },
      include: { category: true },
    })
  }

  /**
   * Tạo món ăn mới
   */
  createDish(data: CreateDishBodyType) {
    return this.prisma.dish.create({ data })
  }

  /**
   * Cập nhật thông tin món ăn
   */
  updateDish(id: number, data: UpdateDishBodyType) {
    return this.prisma.dish.update({ where: { id }, data })
  }

  /**
   * Cập nhật nhanh trạng thái món ăn (Available / Unavailable / Hidden).
   * Sau khi cập nhật DB → emit socket `dish-status-changed` tới toàn bộ client.
   */
  async updateDishStatus(id: number, data: UpdateDishStatusBodyType) {
    const dish = await this.prisma.dish.update({
      where: { id },
      data: { status: data.status },
    })

    // Broadcast realtime cho cả Manager và Guest
    this.eventsGateway.emitDishStatusChanged({
      id: dish.id,
      status: dish.status,
      name: dish.name,
    })

    return dish
  }

  /**
   * Xóa món ăn
   */
  deleteDish(id: number) {
    return this.prisma.dish.delete({ where: { id } })
  }
}
