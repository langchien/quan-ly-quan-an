import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service.js'
import type { EnvType } from '../config/env.config.js'
import { ManagerRoom, Role, TokenType, type TokenPayload } from '../constants/type.js'
import type {
  OrderWithRelations,
  SocketEventName,
  SocketEventPayloads,
  TableTokenRotatedPayload,
  CallStaffPayload,
} from './events.types.js'

/**
 * Socket instance đã xác thực — gắn thêm `decodedAccessToken`
 * sau khi verify JWT trong `handleConnection`.
 */
interface AuthenticatedSocket extends Socket {
  decodedAccessToken?: TokenPayload
}

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

  async handleConnection(socket: AuthenticatedSocket) {
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

      socket.decodedAccessToken = payload
      console.log(`Socket connected: ${socket.id} | role: ${role} | userId: ${userId}`)
    } catch {
      socket.disconnect()
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Socket disconnected: ${socket.id}`)
    await this.prisma.socket.deleteMany({ where: { socketId: socket.id } }).catch(() => {})
  }

  /**
   * Helper: emit event tới Manager room và (nếu có) guest socket.
   */
  private emitToRooms<E extends SocketEventName>(
    event: E,
    payload: SocketEventPayloads[E],
    guestSocketId?: string
  ) {
    if (guestSocketId) {
      this.server.to(ManagerRoom).to(guestSocketId).emit(event, payload)
    } else {
      this.server.to(ManagerRoom).emit(event, payload)
    }
  }

  emitNewOrder(orders: OrderWithRelations[], guestSocketId?: string) {
    this.emitToRooms('new-order', orders, guestSocketId)
  }

  emitUpdateOrder(order: OrderWithRelations, guestSocketId?: string) {
    this.emitToRooms('update-order', order, guestSocketId)
  }

  emitPayment(orders: OrderWithRelations[], guestSocketId?: string) {
    this.emitToRooms('payment', orders, guestSocketId)
  }

  /**
   * Thông báo manager rằng token QR bàn đã được rotate.
   * Chỉ gửi tới Manager room (khách không cần biết — họ đã login qua JWT).
   */
  emitTableTokenRotated(payload: TableTokenRotatedPayload) {
    this.server.to(ManagerRoom).emit('table-token-rotated', payload)
  }

  /**
   * Lắng nghe event 'call-staff' từ guest socket.
   * Server xác thực thông tin từ JWT rồi forward payload tới Manager room.
   */
  @SubscribeMessage('call-staff')
  async handleCallStaff(
    @MessageBody() data: { message?: string },
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const payload = socket.decodedAccessToken
    if (!payload || payload.role !== 'Guest') {
      return { error: 'Unauthorized' }
    }

    // Lấy thông tin guest từ DB
    const guest = await this.prisma.guest.findUnique({
      where: { id: payload.userId },
    })

    if (!guest || guest.tableNumber == null) {
      return { error: 'Guest not found or not seated' }
    }

    const callStaffPayload: CallStaffPayload = {
      tableNumber: guest.tableNumber,
      guestName: guest.name,
      message: data?.message,
      calledAt: new Date().toISOString(),
    }

    // Forward tới tất cả manager
    this.server.to(ManagerRoom).emit('call-staff', callStaffPayload)

    return { success: true }
  }

  /**
   * Emit call-staff từ server (dành cho trường hợp server-side trigger).
   */
  emitCallStaff(payload: CallStaffPayload) {
    this.server.to(ManagerRoom).emit('call-staff', payload)
  }
}
