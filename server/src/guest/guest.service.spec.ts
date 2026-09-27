import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusError } from '../common/index.js'
import { TableStatus } from '@app/shared'
import { GuestService } from './guest.service.js'

const makeTable = (overrides = {}) => ({
  number: 1,
  status: TableStatus.Available,
  token: 'valid-token',
  capacity: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeGuest = (overrides = {}) => ({
  id: 1,
  name: 'Nguyen Van A',
  tableNumber: 1,
  refreshToken: 'refresh-token',
  refreshTokenExpiresAt: new Date(Date.now() + 86400000),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makePrisma = () => ({
  table: {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  guest: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
  },
  socket: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  $transaction: vi.fn(),
})

describe('GuestService', () => {
  let service: GuestService
  let prisma: ReturnType<typeof makePrisma>
  let jwtService: JwtService
  let configService: ConfigService

  beforeEach(() => {
    prisma = makePrisma()

    jwtService = {
      sign: vi.fn().mockReturnValue('mocked.token'),
      verify: vi.fn().mockReturnValue({
        userId: 1,
        role: 'Guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    } as unknown as JwtService

    configService = {
      get: vi.fn().mockReturnValue('test_secret'),
    } as unknown as ConfigService

    const orderService = {} as any // OrderService mock — not used in auth tests

    service = new GuestService(prisma as any, jwtService, configService as any, orderService)
  })

  describe('login()', () => {
    it('nen tra ve guest, accessToken, refreshToken khi ban va token hop le', async () => {
      const table = makeTable()
      const guest = makeGuest()

      prisma.table.findUnique.mockResolvedValue(table)
      prisma.guest.create.mockResolvedValue(guest)
      prisma.guest.update.mockResolvedValue({ ...guest, refreshToken: 'mocked.token' })

      const result = await service.login({
        name: 'Nguyen Van A',
        tableNumber: 1,
        token: 'valid-token',
      })

      expect(result).toHaveProperty('guest')
      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(prisma.guest.create).toHaveBeenCalledOnce()
      expect(prisma.guest.update).toHaveBeenCalledOnce()
    })

    it('nen throw StatusError 401 khi ban khong ton tai hoac token sai', async () => {
      prisma.table.findUnique.mockResolvedValue(null)

      await expect(
        service.login({ name: 'Guest', tableNumber: 99, token: 'wrong' })
      ).rejects.toThrow(StatusError)

      await expect(
        service.login({ name: 'Guest', tableNumber: 99, token: 'wrong' })
      ).rejects.toThrow(StatusError)
    })

    it('nen throw StatusError 400 khi ban bi an (Hidden)', async () => {
      prisma.table.findUnique.mockResolvedValue(makeTable({ status: TableStatus.Hidden }))

      await expect(
        service.login({ name: 'Guest', tableNumber: 1, token: 'valid-token' })
      ).rejects.toThrow(StatusError)
    })

    it('nen throw StatusError 400 khi ban da duoc dat truoc (Reserved)', async () => {
      prisma.table.findUnique.mockResolvedValue(makeTable({ status: TableStatus.Reserved }))

      await expect(
        service.login({ name: 'Guest', tableNumber: 1, token: 'valid-token' })
      ).rejects.toThrow(StatusError)
    })
  })

  describe('logout()', () => {
    it('nen cap nhat refreshToken = null va tra ve message thanh cong', async () => {
      prisma.guest.update.mockResolvedValue(makeGuest({ refreshToken: null }))

      const result = await service.logout(1)

      expect(result).toBe('\u0110\u0103ng xu\u1ea5t th\u00e0nh c\u00f4ng')
      expect(prisma.guest.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: null, refreshTokenExpiresAt: null },
      })
    })
  })

  describe('refreshToken()', () => {
    it('nen tra ve token moi khi refresh token hop le va khop DB', async () => {
      const guest = makeGuest({ refreshToken: 'old-token' })
      prisma.guest.findUnique.mockResolvedValue(guest)
      prisma.guest.update.mockResolvedValue({ ...guest, refreshToken: 'mocked.token' })

      const result = await service.refreshToken({ refreshToken: 'old-token' })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
    })

    it('nen throw UnauthorizedException khi refresh token khong khop DB', async () => {
      const guest = makeGuest({ refreshToken: 'different-token' })
      prisma.guest.findUnique.mockResolvedValue(guest)

      await expect(service.refreshToken({ refreshToken: 'old-token' })).rejects.toThrow(
        UnauthorizedException
      )
    })

    it('nen throw UnauthorizedException khi guest khong ton tai trong DB', async () => {
      prisma.guest.findUnique.mockResolvedValue(null)

      await expect(service.refreshToken({ refreshToken: 'any-token' })).rejects.toThrow(
        UnauthorizedException
      )
    })
  })

  describe('getOrders()', () => {
    it('nen query dung guestId va tra ve danh sach don hang', async () => {
      prisma.order.findMany.mockResolvedValue([])

      await service.getOrders(42)

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { guestId: 42 },
        })
      )
    })
  })
})
