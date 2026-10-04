import { Module } from '@nestjs/common'
import { DishController } from './dish.controller.js'
import { DishService } from './dish.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { EventsModule } from '../events/events.module.js'

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule để dùng AccessTokenGuard
    AuthModule,
    // Import EventsModule để DishService có thể emit socket events
    EventsModule,
  ],
  controllers: [DishController],
  providers: [DishService],
})
export class DishModule {}
