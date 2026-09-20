import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js'
import { EntityErrorException } from '../common/index.js'
import type { CreateTableBodyType, UpdateTableBodyType } from './dto/table.schema.js'

/**
 * Tạo token ngẫu nhiên cho bàn (dùng làm QR code token)
 */
function randomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả các bàn
   */
  getTableList() {
    return this.prisma.table.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Lấy chi tiết một bàn theo số bàn
   */
  getTableDetail(number: number) {
    return this.prisma.table.findUniqueOrThrow({ where: { number } })
  }

  /**
   * Tạo bàn mới, tự sinh token ngẫu nhiên
   */
  async createTable(data: CreateTableBodyType) {
    const token = randomId()
    try {
      return await this.prisma.table.create({
        data: { ...data, token }
      })
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new EntityErrorException([{ field: 'number', message: 'Số bàn này đã tồn tại' }])
      }
      throw error
    }
  }

  /**
   * Cập nhật bàn; nếu changeToken = true thì sinh token mới (rotate QR)
   */
  updateTable(number: number, data: UpdateTableBodyType) {
    if (data.changeToken) {
      const token = randomId()
      return this.prisma.table.update({
        where: { number },
        data: {
          status: data.status,
          capacity: data.capacity,
          token
        }
      })
    }
    return this.prisma.table.update({
      where: { number },
      data: {
        status: data.status,
        capacity: data.capacity
      }
    })
  }

  /**
   * Xóa bàn theo số bàn
   */
  deleteTable(number: number) {
    return this.prisma.table.delete({ where: { number } })
  }
}
