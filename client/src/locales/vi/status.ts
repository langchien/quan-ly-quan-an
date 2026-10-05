export const status = {
  order: {
    Pending: 'Chờ xử lý',
    Processing: 'Đang nấu',
    Rejected: 'Bị từ chối',
    Delivered: 'Đã phục vụ',
    Paid: 'Đã thanh toán',
  },
  dish: {
    Available: 'Đang bán',
    Unavailable: 'Tạm hết',
    Hidden: 'Ẩn',
  },
  table: {
    Available: 'Trống',
    Reserved: 'Đã đặt',
    Hidden: 'Ẩn',
  },
  bill: {
    Pending: 'Chờ thanh toán',
    Paid: 'Đã thanh toán',
    Cancelled: 'Đã hủy',
  },
  role: {
    Owner: 'Chủ quán',
    Employee: 'Nhân viên',
    Guest: 'Khách',
  },
  payment: {
    PayOS: 'VietQR',
    Cash: 'Tiền mặt',
  },
} as const
