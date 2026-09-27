import { Controller, Get, Post, Put, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { TableService } from './table.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { ZodBody, ZodParam } from '../common/index.js'
import { Role } from '@app/shared'
import {
  CreateTableBody,
  type CreateTableBodyType,
  UpdateTableBody,
  type UpdateTableBodyType,
  TableParams,
  type TableParamsType,
} from './dto/table.schema.js'

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  /**
   * GET /tables
   * Lấy danh sách tất cả các bàn
   */
  @Get()
  async getTableList() {
    const tables = await this.tableService.getTableList()
    return { message: 'Lấy danh sách bàn thành công', data: tables }
  }

  /**
   * GET /tables/:number
   * Lấy chi tiết một bàn theo số bàn
   */
  @Get(':number')
  async getTable(@ZodParam(TableParams) params: TableParamsType) {
    const table = await this.tableService.getTableDetail(params.number)
    return { message: 'Lấy thông tin bàn thành công', data: table }
  }

  /**
   * POST /tables
   * Tạo bàn mới — Owner + Employee
   */
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTable(@ZodBody(CreateTableBody) body: CreateTableBodyType) {
    const table = await this.tableService.createTable(body)
    return { message: 'Tạo bàn thành công', data: table }
  }

  /**
   * PUT /tables/:number
   * Cập nhật thông tin bàn (có thể rotate token QR) — Owner + Employee
   */
  @Put(':number')
  @UseGuards(AccessTokenGuard, RolesGuard)
  async updateTable(
    @ZodParam(TableParams) params: TableParamsType,
    @ZodBody(UpdateTableBody) body: UpdateTableBodyType
  ) {
    const table = await this.tableService.updateTable(params.number, body)
    return { message: 'Cập nhật bàn thành công', data: table }
  }

  /**
   * DELETE /tables/:number
   * Xóa bàn theo số bàn — chỉ Owner
   */
  @Delete(':number')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  async deleteTable(@ZodParam(TableParams) params: TableParamsType) {
    const table = await this.tableService.deleteTable(params.number)
    return { message: 'Xóa bàn thành công', data: table }
  }
}
