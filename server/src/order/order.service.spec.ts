import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusError } from '../common/index.js'
import { DishStatus, OrderStatus, TableStatus } from '@app/shared'
import { OrderService } from './order.service.js'

// Factories

const makeOrder = (overrides = {}) => ({
  id: 1,
  guestId: 1,
  tableNumber: 1,
  dishSnapshotId: 10,
  dishSnapshot: {
    id: 10,
    dishId: 5,
    name: 'Pho',
    price: 50000,
    image: '',
    description: '',
    status: DishStatus.Available,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  quantity: 2,
  orderHandlerId: null,
  orderHandler: null,
  guest: null,
  status: OrderStatus.Pending,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeDish = (overrides = {}) => ({
  id: 5,
  name: 'Pho',
  price: 50000,
  image: '',
  description: '',
  status: DishStatus.Available,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeGuest = (overrides = {}) => ({
  id: 1,
  name: 'Guest A',
  tableNumber: 1,
  refreshToken: null,
  refreshTokenExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeTable = (overrides = {}) => ({
  number: 1,
  status: TableStatus.Available,
  token: 'tok',
  capacity: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Mock Prisma

const makePrisma = () => ({
  order: {
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  guest: {
    findUniqueOrThrow: vi.fn(),
  },
  table: {
    findUniqueOrThrow: vi.fn(),
  },
  socket: {
    findUnique: vi.fn().mockResolvedValue(null),
  },
  $transaction: vi.fn(),
})

describe('OrderService', () => {
  let service: OrderService
  let prisma: ReturnType<typeof makePrisma>

  beforeEach(() => {
    prisma = makePrisma()
    service = new OrderService(prisma as any)
  })

  describe('getOrderList()', () => {
    it('nen query dung dieu kien when fromDate va toDate duoc truyen', async () => {
      prisma.order.findMany.mockResolvedValue([])
      prisma.order.count.mockResolvedValue(0)
      const from = new Date('2024-01-01')
      const to = new Date('2024-01-31')

      await service.getOrderList({ fromDate: from, toDate: to, page: 1, limit: 20 })

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: { gte: from, lte: to },
          },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 20,
        })
      )
    })

    it('nen tra ve tat ca don hang khi khong co filter', async () => {
      prisma.order.findMany.mockResolvedValue([makeOrder()])
      prisma.order.count.mockResolvedValue(1)

      const result = await service.getOrderList({ page: 1, limit: 20 })

      expect(result.data).toHaveLength(1)
      expect(result.pagination).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 20,
      })
    })
  })

  describe('getOrderDetail()', () => {
    it('nen goi findUniqueOrThrow dung orderId va include day du relations', async () => {
      const order = { ...makeOrder(), table: makeTable() }
      prisma.order.findUniqueOrThrow.mockResolvedValue(order)

      const result = await service.getOrderDetail(1)

      expect(result).toMatchObject({ id: 1 })
      expect(prisma.order.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          dishSnapshot: true,
          orderHandler: true,
          guest: true,
          table: true,
        },
      })
    })
  })

  describe('updateOrder()', () => {
    it('nen cap nhat order va tra ve order kem guestSocketId', async () => {
      const order = makeOrder()
      const updatedOrder = { ...order, status: OrderStatus.Processing, guestId: 1 }

      // Mock $transaction: goi callback ngay lap tuc
      prisma.$transaction.mockImplementation((cb: any) => {
        const tx = {
          order: {
            findUniqueOrThrow: vi.fn().mockResolvedValue(order),
            update: vi.fn().mockResolvedValue(updatedOrder),
          },
          dish: { findUniqueOrThrow: vi.fn() },
          dishSnapshot: { create: vi.fn() },
        }
        return cb(tx)
      })
      prisma.socket.findUnique.mockResolvedValue({
        socketId: 'abc123',
        guestId: 1,
        accountId: null,
      })

      const result = await service.updateOrder(1, {
        status: OrderStatus.Processing,
        dishId: 5, // cung dishId, khong doi mon
        quantity: 2,
        orderHandlerId: 10,
      })

      expect(result.order.status).toBe(OrderStatus.Processing)
      expect(result.guestSocketId).toBe('abc123')
    })
  })

  describe('payGuestOrders()', () => {
    it('nen throw StatusError 400 khi khong co don hang can thanh toan', async () => {
      prisma.order.findMany.mockResolvedValue([])

      await expect(service.payGuestOrders({ guestId: 1, orderHandlerId: 10 })).rejects.toThrow(
        StatusError
      )

      await expect(service.payGuestOrders({ guestId: 1, orderHandlerId: 10 })).rejects.toThrow(
        StatusError
      )
    })

    it('nen cap nhat trang thai Paid va tra ve danh sach don da thanh toan', async () => {
      const pending = [makeOrder({ id: 1 }), makeOrder({ id: 2 })]
      const paid = pending.map(o => ({ ...o, status: OrderStatus.Paid }))

      prisma.order.findMany
        .mockResolvedValueOnce(pending) // lan 1: lay pending orders
        .mockResolvedValueOnce(paid) // lan 2: lay sau khi updateMany

      prisma.order.updateMany.mockResolvedValue({ count: 2 })
      prisma.socket.findUnique.mockResolvedValue(null)

      const result = await service.payGuestOrders({ guestId: 1, orderHandlerId: 10 })

      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        data: { status: OrderStatus.Paid, orderHandlerId: 10 },
      })
      expect(result.orders).toHaveLength(2)
      expect(result.guestSocketId).toBeUndefined()
    })
  })

  describe('createOrders() - manager tao don cho guest', () => {
    it('nen throw StatusError khi tableNumber cua guest la null', async () => {
      prisma.guest.findUniqueOrThrow.mockResolvedValue(makeGuest({ tableNumber: null }))

      await expect(
        service.createOrders(10, {
          guestId: 1,
          orders: [{ dishId: 5, quantity: 1 }],
        })
      ).rejects.toThrow(StatusError)
    })

    it('nen throw StatusError khi ban bi an (Hidden)', async () => {
      prisma.guest.findUniqueOrThrow.mockResolvedValue(makeGuest())
      prisma.table.findUniqueOrThrow.mockResolvedValue(makeTable({ status: TableStatus.Hidden }))

      await expect(
        service.createOrders(10, {
          guestId: 1,
          orders: [{ dishId: 5, quantity: 1 }],
        })
      ).rejects.toThrow(StatusError)
    })
  })
})
