import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@app/shared'

const statusConfig: Record<string, { label: string; className: string }> = {
  [OrderStatus.Pending]: {
    label: 'Chờ xử lý',
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  [OrderStatus.Processing]: {
    label: 'Đang nấu',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  },
  [OrderStatus.Delivered]: {
    label: 'Đã phục vụ',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  },
  [OrderStatus.Paid]: {
    label: 'Đã thanh toán',
    className:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  },
  [OrderStatus.Rejected]: {
    label: 'Bị từ chối',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  },
}

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: '' }
  return (
    <Badge variant='outline' className={config.className}>
      {config.label}
    </Badge>
  )
}
