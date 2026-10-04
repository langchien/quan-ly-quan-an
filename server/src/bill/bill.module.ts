import { Module } from '@nestjs/common'
import { BillController } from './bill.controller.js'
import { BillService } from './bill.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { EventsModule } from '../events/events.module.js'
import { PayosModule } from '../payos/payos.module.js'

@Module({
  imports: [PrismaModule, AuthModule, EventsModule, PayosModule],
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService],
})
export class BillModule {}
