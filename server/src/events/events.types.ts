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
 * Payload gửi khi token QR bàn bị rotate (sau thanh toán).
 * Manager dashboard cần refresh lại danh sách bàn để hiển thị QR mới.
 */
export interface TableTokenRotatedPayload {
  tableNumber: number
  /** Token mới đã được sinh — dùng để tạo QR code mới */
  newToken: string
}

/**
 * Payload khi khách gọi nhân viên từ bàn.
 * Guest emit lên server → server forward tới Manager room.
 */
export interface CallStaffPayload {
  /** Số bàn của khách */
  tableNumber: number
  /** Tên khách */
  guestName: string
  /** Nội dung yêu cầu hỗ trợ (tuỳ chọn) */
  message?: string
  /** Thời điểm gọi (ISO string) */
  calledAt: string
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
  payment: OrderWithRelations[]
  /** Khi token QR bàn được rotate sau thanh toán */
  'table-token-rotated': TableTokenRotatedPayload
  /** Khi khách gọi nhân viên từ bàn */
  'call-staff': CallStaffPayload
}

/** Tên các socket events hợp lệ */
export type SocketEventName = keyof SocketEventPayloads
