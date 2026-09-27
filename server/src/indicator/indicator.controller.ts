import { Controller, Get, UseGuards } from '@nestjs/common'
import { IndicatorService } from './indicator.service.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { ZodQuery } from '../common/index.js'
import {
  DashboardIndicatorQueryParams,
  type DashboardIndicatorQueryParamsType,
} from './dto/indicator.schema.js'
import { Role } from '../constants/type.js'

@Controller('indicators')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles([Role.Owner])
export class IndicatorController {
  constructor(private readonly indicatorService: IndicatorService) {}

  /**
   * GET /indicators/dashboard?fromDate=...&toDate=...
   * Lấy dữ liệu tổng quan dashboard
   */
  @Get('dashboard')
  async getDashboardIndicator(
    @ZodQuery(DashboardIndicatorQueryParams) query: DashboardIndicatorQueryParamsType
  ) {
    const data = await this.indicatorService.getDashboardIndicator(query)
    return { data }
  }
}
