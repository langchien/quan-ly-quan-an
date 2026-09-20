import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common'
import { ActiveUser } from '../auth/decorators/active-user.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { ZodBody, ZodParam } from '../common/index.js'
import type { TokenPayload } from '../constants/type.js'
import { AccountService } from './account.service.js'
import {
  AccountIdParam,
  type AccountIdParamType,
  ChangePasswordBody,
  type ChangePasswordBodyType,
  CreateEmployeeAccountBody,
  type CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBody,
  type UpdateEmployeeAccountBodyType,
  UpdateMeBody,
  type UpdateMeBodyType,
} from './dto/account.schema.js'

@Controller()
@UseGuards(AccessTokenGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * GET /accounts/me
   * Lấy thông tin tài khoản đang đăng nhập
   */
  @Get('accounts/me')
  async getMe(@ActiveUser() user: TokenPayload) {
    const account = await this.accountService.getMe(user.userId)
    return { message: 'Lấy thông tin thành công', data: account }
  }

  /**
   * PUT /accounts/me
   * Cập nhật thông tin cá nhân
   */
  @Put('accounts/me')
  async updateMe(@ActiveUser() user: TokenPayload, @ZodBody(UpdateMeBody) body: UpdateMeBodyType) {
    const account = await this.accountService.updateMe(user.userId, body)
    return { message: 'Cập nhật thành công', data: account }
  }

  /**
   * PUT /accounts/change-password
   * Đổi mật khẩu tài khoản đang đăng nhập
   */
  @Put('accounts/change-password')
  async changePassword(
    @ActiveUser() user: TokenPayload,
    @ZodBody(ChangePasswordBody) body: ChangePasswordBodyType
  ) {
    const account = await this.accountService.changePassword(user.userId, body)
    return { message: 'Đổi mật khẩu thành công', data: account }
  }

  /**
   * GET /accounts
   * Lấy danh sách tất cả tài khoản (trừ tài khoản hiện tại)
   */
  @Get('accounts')
  async getAccountList(@ActiveUser() user: TokenPayload) {
    const accounts = await this.accountService.getAccountList(user.userId)
    return { message: 'Lấy danh sách thành công', data: accounts }
  }

  /**
   * GET /employees
   * Lấy danh sách nhân viên
   */
  @Get('employees')
  async getEmployeeList() {
    const accounts = await this.accountService.getEmployeeList()
    return { message: 'Lấy danh sách nhân viên thành công', data: accounts }
  }

  /**
   * GET /employees/:id
   * Lấy thông tin một nhân viên
   */
  @Get('employees/:id')
  async getEmployee(@ZodParam(AccountIdParam) params: AccountIdParamType) {
    const account = await this.accountService.getEmployeeDetail(params.id)
    return { message: 'Lấy thông tin nhân viên thành công', data: account }
  }

  /**
   * POST /employees
   * Tạo tài khoản nhân viên mới
   */
  @Post('employees')
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(@ZodBody(CreateEmployeeAccountBody) body: CreateEmployeeAccountBodyType) {
    const account = await this.accountService.createEmployee(body)
    return { message: 'Tạo tài khoản nhân viên thành công', data: account }
  }

  /**
   * PUT /employees/:id
   * Cập nhật thông tin nhân viên
   */
  @Put('employees/:id')
  async updateEmployee(
    @ZodParam(AccountIdParam) params: AccountIdParamType,
    @ZodBody(UpdateEmployeeAccountBody) body: UpdateEmployeeAccountBodyType
  ) {
    const account = await this.accountService.updateEmployee(params.id, body)
    return { message: 'Cập nhật nhân viên thành công', data: account }
  }

  /**
   * DELETE /employees/:id
   * Xóa tài khoản nhân viên
   */
  @Delete('employees/:id')
  @HttpCode(HttpStatus.OK)
  async deleteEmployee(@ZodParam(AccountIdParam) params: AccountIdParamType) {
    const account = await this.accountService.deleteEmployee(params.id)
    return { message: 'Xóa nhân viên thành công', data: account }
  }
}
