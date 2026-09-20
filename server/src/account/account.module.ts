import { Module } from '@nestjs/common'
import { AccountController } from './account.controller.js'
import { AccountService } from './account.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule để dùng AccessTokenGuard
    AuthModule
  ],
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule {}
