import { Module } from '@nestjs/common'
import { OrderController } from './order.controller.js'
import { OrderService } from './order.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { EventsModule } from '../events/events.module.js'

@Module({
  imports: [PrismaModule, AuthModule, EventsModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
