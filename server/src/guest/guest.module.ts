import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { GuestController } from './guest.controller.js'
import { GuestService } from './guest.service.js'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { GuestAccessTokenGuard } from '../auth/guards/guest-access-token.guard.js'
import { EventsModule } from '../events/events.module.js'
import { OrderModule } from '../order/order.module.js'

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule để dùng JwtService từ AuthModule
    AuthModule,
    // JwtModule riêng với register({}) để GuestService tự cấu hình secret khi sign
    JwtModule.register({}),
    EventsModule,
    // Import OrderModule để GuestService dùng chung logic createOrdersForGuest
    OrderModule,
  ],
  controllers: [GuestController],
  providers: [GuestService, GuestAccessTokenGuard],
})
export class GuestModule {}
