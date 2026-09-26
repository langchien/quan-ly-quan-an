import { Module } from '@nestjs/common'
import { CategoryController } from './category.controller.js'
import { CategoryService } from './category.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule để dùng AccessTokenGuard
    AuthModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
