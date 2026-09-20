import { Module } from '@nestjs/common'
import { MediaController } from './media.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    // Import AuthModule để dùng AccessTokenGuard và JwtService
    AuthModule
  ],
  controllers: [MediaController]
})
export class MediaModule {}
