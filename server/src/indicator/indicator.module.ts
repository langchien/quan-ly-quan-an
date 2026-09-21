import { Module } from '@nestjs/common'
import { IndicatorController } from './indicator.controller.js'
import { IndicatorService } from './indicator.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [IndicatorController],
  providers: [IndicatorService],
})
export class IndicatorModule {}
