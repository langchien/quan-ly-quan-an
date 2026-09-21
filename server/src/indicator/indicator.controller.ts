import { Controller, Get, UseGuards } from '@nestjs/common'
import { IndicatorService } from './indicator.service.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { ZodQuery } from '../common/index.js'
import {
  DashboardIndicatorQueryParams,
  type DashboardIndicatorQueryParamsType,
} from './dto/indicator.schema.js'

@Controller('indicators')
@UseGuards(AccessTokenGuard)
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
