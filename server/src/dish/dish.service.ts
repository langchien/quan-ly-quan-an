import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import type { CreateDishBodyType, UpdateDishBodyType } from './dto/dish.schema.js'

@Injectable()
export class DishService {
  constructor(private readonly prisma: PrismaService) {}

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
   * Xóa món ăn
   */
  deleteDish(id: number) {
    return this.prisma.dish.delete({ where: { id } })
  }
}
