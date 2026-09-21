import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { AccessTokenGuard } from './guards/access-token.guard.js'
import { PrismaModule } from '../prisma/prisma.module.js'

@Module({
  imports: [
    PrismaModule,
    // Không cấu hình global secret ở đây, mỗi sign/verify tự truyền secret riêng
    // để hỗ trợ cả ACCESS_TOKEN_SECRET và REFRESH_TOKEN_SECRET
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard],
  // Export để các module khác (MediaModule, AccountModule...) có thể dùng Guard
  exports: [AuthService, AccessTokenGuard, JwtModule],
})
export class AuthModule {}
