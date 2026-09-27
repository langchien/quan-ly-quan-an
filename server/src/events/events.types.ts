import type {
  OrderModel,
  DishSnapshotModel,
  AccountModel,
  GuestModel,
} from '../generated/prisma/models.js'

/**
 * Order record kèm relations — đây là payload thực tế
 * mà các emit methods gửi qua socket.
 *
 * Prisma trả về kiểu này khi `include: { dishSnapshot, orderHandler, guest }`.
 */
export type OrderWithRelations = OrderModel & {
  dishSnapshot: DishSnapshotModel
  orderHandler: AccountModel | null
  guest: GuestModel | null
}

/**
 * Mapping tên socket event → kiểu payload tương ứng.
 * Dùng chung cho cả server (emit) và client (listen).
 */
export interface SocketEventPayloads {
  /** Khi có đơn hàng mới được tạo (1 hoặc nhiều) */
  'new-order': OrderWithRelations[]
  /** Khi trạng thái 1 đơn hàng được cập nhật */
  'update-order': OrderWithRelations
  /** Khi thanh toán hoàn tất (1 hoặc nhiều đơn) */
  'payment': OrderWithRelations[]
}

/** Tên các socket events hợp lệ */
export type SocketEventName = keyof SocketEventPayloads
