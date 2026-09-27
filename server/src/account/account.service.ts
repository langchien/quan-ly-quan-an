import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { EntityErrorException } from '../common/index.js'
import { Role } from '@app/shared'
import { PrismaService } from '../prisma/prisma.service.js'
import type {
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType,
} from './dto/account.schema.js'

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeList() {
    return this.prisma.account.findMany({
      where: { role: Role.Employee },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getEmployeeDetail(id: number) {
    return this.prisma.account.findUniqueOrThrow({ where: { id } })
  }

  /**
   * Trả về toàn bộ tài khoản trừ tài khoản đang đăng nhập
   */
  async getAccountList(currentUserId: number) {
    return this.prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
      where: { id: { not: currentUserId } },
    })
  }

  async createEmployee(body: CreateEmployeeAccountBodyType) {
    const hashedPassword = await bcrypt.hash(body.password, 10)
    try {
      return await this.prisma.account.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          role: Role.Employee,
          avatar: body.avatar ?? null,
        },
      })
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new EntityErrorException([{ field: 'email', message: 'Email đã tồn tại' }])
      }
      throw error
    }
  }

  async updateEmployee(id: number, body: UpdateEmployeeAccountBodyType) {
    try {
      if (body.changePassword && body.password) {
        const hashedPassword = await bcrypt.hash(body.password, 10)
        return await this.prisma.account.update({
          where: { id },
          data: {
            name: body.name,
            email: body.email,
            avatar: body.avatar ?? null,
            password: hashedPassword,
          },
        })
      }
      return await this.prisma.account.update({
        where: { id },
        data: {
          name: body.name,
          email: body.email,
          avatar: body.avatar ?? null,
        },
      })
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new EntityErrorException([{ field: 'email', message: 'Email đã tồn tại' }])
      }
      throw error
    }
  }

  async deleteEmployee(id: number) {
    return this.prisma.account.delete({ where: { id } })
  }

  async getMe(userId: number) {
    return this.prisma.account.findUniqueOrThrow({ where: { id: userId } })
  }

  async updateMe(userId: number, body: UpdateMeBodyType) {
    return this.prisma.account.update({
      where: { id: userId },
      data: body,
    })
  }

  async changePassword(userId: number, body: ChangePasswordBodyType) {
    const account = await this.prisma.account.findUniqueOrThrow({ where: { id: userId } })

    const isMatch = await bcrypt.compare(body.oldPassword, account.password)
    if (!isMatch) {
      throw new EntityErrorException([{ field: 'oldPassword', message: 'Mật khẩu cũ không đúng' }])
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    return this.prisma.account.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  }
}
