import { Module } from '@nestjs/common'
import { TableController } from './table.controller.js'
import { TableService } from './table.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule để dùng AccessTokenGuard
    AuthModule
  ],
  controllers: [TableController],
  providers: [TableService]
})
export class TableModule {}
