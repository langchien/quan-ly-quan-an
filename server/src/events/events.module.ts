import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { EventsGateway } from './events.gateway.js'
import { PrismaModule } from '../prisma/prisma.module.js'

@Module({
  imports: [
    PrismaModule,
    // JwtModule c?n thi?t d? verify token trong gateway
    JwtModule.register({}),
  ],
  providers: [EventsGateway],
  // Export d? GuestModule v� OrderModule inject EventsGateway
  exports: [EventsGateway],
})
export class EventsModule {}
