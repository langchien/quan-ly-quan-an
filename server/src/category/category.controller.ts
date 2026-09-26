import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { ZodBody, ZodParam } from '../common/index.js'
import { CategoryService } from './category.service.js'
import {
  CategoryParams,
  type CategoryParamsType,
  CreateCategoryBody,
  type CreateCategoryBodyType,
  UpdateCategoryBody,
  type UpdateCategoryBodyType,
} from './dto/category.schema.js'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * GET /categories
   * Lấy danh sách danh mục (public — guest cần xem để hiển thị tabs)
   */
  @Get()
  async getCategoryList() {
    const categories = await this.categoryService.getCategoryList()
    return { message: 'Lấy danh sách danh mục thành công', data: categories }
  }

  /**
   * GET /categories/:id
   * Lấy chi tiết danh mục
   */
  @Get(':id')
  async getCategory(@ZodParam(CategoryParams) params: CategoryParamsType) {
    const category = await this.categoryService.getCategoryDetail(params.id)
    return { message: 'Lấy thông tin danh mục thành công', data: category }
  }

  /**
   * POST /categories
   * Tạo danh mục mới (chỉ nhân viên/owner)
   */
  @Post()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@ZodBody(CreateCategoryBody) body: CreateCategoryBodyType) {
    const category = await this.categoryService.createCategory(body)
    return { message: 'Tạo danh mục thành công', data: category }
  }

  /**
   * PUT /categories/:id
   * Cập nhật danh mục
   */
  @Put(':id')
  @UseGuards(AccessTokenGuard)
  async updateCategory(
    @ZodParam(CategoryParams) params: CategoryParamsType,
    @ZodBody(UpdateCategoryBody) body: UpdateCategoryBodyType
  ) {
    const category = await this.categoryService.updateCategory(params.id, body)
    return { message: 'Cập nhật danh mục thành công', data: category }
  }

  /**
   * DELETE /categories/:id
   * Xóa danh mục (món ăn liên kết sẽ mất categoryId, không bị xóa)
   */
  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@ZodParam(CategoryParams) params: CategoryParamsType) {
    const category = await this.categoryService.deleteCategory(params.id)
    return { message: 'Xóa danh mục thành công', data: category }
  }
}
