import type { Translation } from '@/lib/i18n/types'
import type { status as vi } from '../vi/status'

export const status = {
  order: {
    Pending: 'Pending',
    Processing: 'Cooking',
    Rejected: 'Rejected',
    Delivered: 'Served',
    Paid: 'Paid',
  },
  dish: {
    Available: 'Available',
    Unavailable: 'Sold out',
    Hidden: 'Hidden',
  },
  table: {
    Available: 'Available',
    Reserved: 'Reserved',
    Hidden: 'Hidden',
  },
  bill: {
    Pending: 'Awaiting payment',
    Paid: 'Paid',
    Cancelled: 'Cancelled',
  },
  role: {
    Owner: 'Owner',
    Employee: 'Employee',
    Guest: 'Guest',
  },
  payment: {
    PayOS: 'VietQR',
    Cash: 'Cash',
  },
} satisfies Translation<typeof vi>
