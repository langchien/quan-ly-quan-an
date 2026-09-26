import { Injectable } from '@nestjs/common'
import { StatusError } from '../common/index.js'
import { PrismaService } from '../prisma/prisma.service.js'
import type { CreateCategoryBodyType, UpdateCategoryBodyType } from './dto/category.schema.js'

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả danh mục, sắp xếp theo `order` ASC, rồi `name` ASC
   */
  getCategoryList() {
    return this.prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    })
  }

  /**
   * Lấy chi tiết danh mục theo id
   */
  getCategoryDetail(id: number) {
    return this.prisma.category.findUniqueOrThrow({ where: { id } })
  }

  /**
   * Tạo danh mục mới
   */
  async createCategory(data: CreateCategoryBodyType) {
    // Kiểm tra tên trùng (Prisma unique constraint sẽ throw, nhưng message không thân thiện)
    const existing = await this.prisma.category.findUnique({ where: { name: data.name } })
    if (existing) {
      throw new StatusError({ message: `Danh mục "${data.name}" đã tồn tại`, status: 409 })
    }
    return this.prisma.category.create({ data })
  }

  /**
   * Cập nhật danh mục
   */
  async updateCategory(id: number, data: UpdateCategoryBodyType) {
    // Kiểm tra tên trùng với danh mục khác
    if (data.name) {
      const existing = await this.prisma.category.findFirst({
        where: { name: data.name, id: { not: id } },
      })
      if (existing) {
        throw new StatusError({ message: `Danh mục "${data.name}" đã tồn tại`, status: 409 })
      }
    }
    return this.prisma.category.update({ where: { id }, data })
  }

  /**
   * Xóa danh mục — các Dish liên kết sẽ có categoryId = null (onDelete: SetNull)
   */
  deleteCategory(id: number) {
    return this.prisma.category.delete({ where: { id } })
  }
}
