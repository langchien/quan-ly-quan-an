import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { EventsGateway } from './events.gateway.js'
import { PrismaModule } from '../prisma/prisma.module.js'

@Module({
  imports: [
    PrismaModule,
    // JwtModule cần thiết để verify token trong gateway
    JwtModule.register({})
  ],
  providers: [EventsGateway],
  // Export để GuestModule và OrderModule inject EventsGateway
  exports: [EventsGateway]
})
export class EventsModule {}
