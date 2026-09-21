import { Module } from '@nestjs/common'
import { DishController } from './dish.controller.js'
import { DishService } from './dish.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule để dùng AccessTokenGuard
    AuthModule,
  ],
  controllers: [DishController],
  providers: [DishService],
})
export class DishModule {}
