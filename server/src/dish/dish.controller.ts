import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { DishService } from './dish.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { ZodBody, ZodParam } from '../common/index.js'
import { Role } from '@app/shared'
import {
  CreateDishBody,
  type CreateDishBodyType,
  UpdateDishBody,
  type UpdateDishBodyType,
  UpdateDishStatusBody,
  type UpdateDishStatusBodyType,
  DishParams,
  type DishParamsType,
} from '@app/shared'

@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  /**
   * GET /dishes
   * Lấy danh sách món ăn (public — không yêu cầu đăng nhập)
   */
  @Get()
  async getDishList() {
    const dishes = await this.dishService.getDishList()
    return { message: 'Lấy danh sách món ăn thành công', data: dishes }
  }

  /**
   * GET /dishes/:id
   * Lấy chi tiết một món ăn (public)
   */
  @Get(':id')
  async getDish(@ZodParam(DishParams) params: DishParamsType) {
    const dish = await this.dishService.getDishDetail(params.id)
    return { message: 'Lấy thông tin món ăn thành công', data: dish }
  }

  /**
   * POST /dishes
   * Tạo món ăn mới — Owner + Employee
   */
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createDish(@ZodBody(CreateDishBody) body: CreateDishBodyType) {
    const dish = await this.dishService.createDish(body)
    return { message: 'Tạo món ăn thành công', data: dish }
  }

  /**
   * PUT /dishes/:id
   * Cập nhật thông tin món ăn — Owner + Employee
   */
  @Put(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  async updateDish(
    @ZodParam(DishParams) params: DishParamsType,
    @ZodBody(UpdateDishBody) body: UpdateDishBodyType
  ) {
    const dish = await this.dishService.updateDish(params.id, body)
    return { message: 'Cập nhật món ăn thành công', data: dish }
  }

  /**
   * PATCH /dishes/:id/status
   * Cập nhật nhanh trạng thái món ăn — Owner + Employee
   * Emit socket `dish-status-changed` tới toàn bộ client sau khi lưu.
   */
  @Patch(':id/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  async updateDishStatus(
    @ZodParam(DishParams) params: DishParamsType,
    @ZodBody(UpdateDishStatusBody) body: UpdateDishStatusBodyType
  ) {
    const dish = await this.dishService.updateDishStatus(params.id, body)
    return { message: 'Cập nhật trạng thái món ăn thành công', data: dish }
  }

  /**
   * DELETE /dishes/:id
   * Xóa món ăn — chỉ Owner
   */
  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.Owner])
  @HttpCode(HttpStatus.OK)
  async deleteDish(@ZodParam(DishParams) params: DishParamsType) {
    const dish = await this.dishService.deleteDish(params.id)
    return { message: 'Xóa món ăn thành công', data: dish }
  }
}
