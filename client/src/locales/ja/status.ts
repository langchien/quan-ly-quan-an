import type { Translation } from '@/lib/i18n/types'
import type { status as vi } from '../vi/status'

export const status = {
  order: {
    Pending: '待機中',
    Processing: '調理中',
    Rejected: '却下',
    Delivered: '提供済み',
    Paid: '会計済み',
  },
  dish: {
    Available: '販売中',
    Unavailable: '売切',
    Hidden: '非表示',
  },
  table: {
    Available: '空席',
    Reserved: '予約済み',
    Hidden: '非表示',
  },
  bill: {
    Pending: '未会計',
    Paid: '会計済み',
    Cancelled: 'キャンセル',
  },
  role: {
    Owner: 'オーナー',
    Employee: 'スタッフ',
    Guest: 'お客様',
  },
  payment: {
    PayOS: 'VietQR',
    Cash: '現金',
  },
} satisfies Translation<typeof vi>
