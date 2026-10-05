import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@app/shared'
import { useStatusLabel } from '@/lib/status-label'

const statusClasses: Record<string, string> = {
  [OrderStatus.Pending]:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  [OrderStatus.Processing]:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  [OrderStatus.Delivered]:
    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  [OrderStatus.Paid]:
    'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  [OrderStatus.Rejected]:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
}

interface OrderStatusBadgeProps {
  status: string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { getOrderStatusLabel } = useStatusLabel()
  const className = statusClasses[status] ?? ''
  return (
    <Badge variant='outline' className={className}>
      {getOrderStatusLabel(status)}
    </Badge>
  )
}
