export const manage = {
  dashboard: {
    title: 'Bảng điều khiển',
    description: 'Tổng quan hoạt động kinh doanh trực tiếp của quán',
    viewByTable: 'Xem theo Bàn',
    viewByDish: 'Xem theo Món (Kanban)',
  },
  orders: {
    title: 'Quản lý đơn hàng',
    description: 'Theo dõi và xử lý các đơn gọi món của khách hàng',
  },
  kitchen: {
    title: 'Bếp (KDS)',
    description: 'Màn hình hiển thị đơn hàng cho bộ phận bếp — cập nhật realtime',
    pending: 'Chờ nấu',
    processing: 'Đang nấu',
  },
  tables: {
    title: 'Quản lý bàn ăn',
    description: 'Quản lý danh sách bàn và mã QR của quán ăn',
  },
  dishes: {
    title: 'Quản lý món ăn',
    description: 'Quản lý thực đơn món ăn của quán',
  },
  staffs: {
    title: 'Quản lý nhân viên',
    description: 'Quản lý tài khoản nhân viên của quán ăn',
  },
  analytics: {
    title: 'Phân tích & Báo cáo',
    description: 'Thống kê doanh thu, đơn hàng và xếp hạng món ăn theo khoảng thời gian',
  },
} as const
