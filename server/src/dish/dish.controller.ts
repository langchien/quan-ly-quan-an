import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { DishService } from './dish.service.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { ZodBody, ZodParam } from '../common/index.js'
import {
  CreateDishBody,
  type CreateDishBodyType,
  UpdateDishBody,
  type UpdateDishBodyType,
  DishParams,
  type DishParamsType
} from './dto/dish.schema.js'

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
   * Tạo món ăn mới
   */
  @Post()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async createDish(@ZodBody(CreateDishBody) body: CreateDishBodyType) {
    const dish = await this.dishService.createDish(body)
    return { message: 'Tạo món ăn thành công', data: dish }
  }

  /**
   * PUT /dishes/:id
   * Cập nhật thông tin món ăn
   */
  @Put(':id')
  @UseGuards(AccessTokenGuard)
  async updateDish(
    @ZodParam(DishParams) params: DishParamsType,
    @ZodBody(UpdateDishBody) body: UpdateDishBodyType
  ) {
    const dish = await this.dishService.updateDish(params.id, body)
    return { message: 'Cập nhật món ăn thành công', data: dish }
  }

  /**
   * DELETE /dishes/:id
   * Xóa món ăn
   */
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async deleteDish(@ZodParam(DishParams) params: DishParamsType) {
    const dish = await this.dishService.deleteDish(params.id)
    return { message: 'Xóa món ăn thành công', data: dish }
  }
}
