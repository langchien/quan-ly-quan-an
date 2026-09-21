import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service.js'
import type { EnvType } from '../config/env.config.js'
import { ManagerRoom, Role, TokenType, type TokenPayload } from '../constants/type.js'

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvType, true>,
    private readonly prisma: PrismaService
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const authHeader =
        socket.handshake.auth?.Authorization ?? socket.handshake.headers?.authorization ?? ''
      const token = authHeader.split(' ')[1]

      if (!token) {
        socket.disconnect()
        return
      }

      let payload: TokenPayload | null = null

      try {
        payload = this.jwtService.verify<TokenPayload>(token, {
          secret: this.configService.get('GUEST_ACCESS_TOKEN_SECRET', { infer: true }),
        })
      } catch {
        try {
          payload = this.jwtService.verify<TokenPayload>(token, {
            secret: this.configService.get('ACCESS_TOKEN_SECRET', { infer: true }),
          })
        } catch {
          socket.disconnect()
          return
        }
      }

      if (!payload || payload.tokenType !== TokenType.AccessToken) {
        socket.disconnect()
        return
      }

      const { userId, role } = payload

      if (role === Role.Guest) {
        await this.prisma.socket.upsert({
          where: { guestId: userId },
          update: { socketId: socket.id },
          create: { guestId: userId, socketId: socket.id },
        })
      } else {
        await this.prisma.socket.upsert({
          where: { accountId: userId },
          update: { socketId: socket.id },
          create: { accountId: userId, socketId: socket.id },
        })
        socket.join(ManagerRoom)
      }

      ;(socket as any).decodedAccessToken = payload
      console.log(`Socket connected: ${socket.id} | role: ${role} | userId: ${userId}`)
    } catch {
      socket.disconnect()
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Socket disconnected: ${socket.id}`)
    await this.prisma.socket.deleteMany({ where: { socketId: socket.id } }).catch(() => {})
  }

  emitNewOrder(orders: any[], guestSocketId?: string) {
    if (guestSocketId) {
      this.server.to(ManagerRoom).to(guestSocketId).emit('new-order', orders)
    } else {
      this.server.to(ManagerRoom).emit('new-order', orders)
    }
  }

  emitUpdateOrder(order: any, guestSocketId?: string) {
    if (guestSocketId) {
      this.server.to(ManagerRoom).to(guestSocketId).emit('update-order', order)
    } else {
      this.server.to(ManagerRoom).emit('update-order', order)
    }
  }

  emitPayment(orders: any[], guestSocketId?: string) {
    if (guestSocketId) {
      this.server.to(ManagerRoom).to(guestSocketId).emit('payment', orders)
    } else {
      this.server.to(ManagerRoom).emit('payment', orders)
    }
  }
}
