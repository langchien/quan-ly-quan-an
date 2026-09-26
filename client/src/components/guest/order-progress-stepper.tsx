import { OrderStatus } from '@/constants/type'
import { Check, ChefHat, Clock, CreditCard, UtensilsCrossed } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────────

interface OrderProgressStepperProps {
  orders: { status: string }[]
}

interface StepConfig {
  key: string
  label: string
  icon: React.ReactNode
}

// ── Constants ───────────────────────────────────────────────────────────────────

const STEPS: StepConfig[] = [
  { key: OrderStatus.Pending, label: 'Chờ xác nhận', icon: <Clock className='h-4 w-4' /> },
  { key: OrderStatus.Processing, label: 'Đang chuẩn bị', icon: <ChefHat className='h-4 w-4' /> },
  {
    key: OrderStatus.Delivered,
    label: 'Đã phục vụ',
    icon: <UtensilsCrossed className='h-4 w-4' />,
  },
  {
    key: OrderStatus.Paid,
    label: 'Đã thanh toán',
    icon: <CreditCard className='h-4 w-4' />,
  },
]

/** Thứ tự ưu tiên của trạng thái (số nhỏ = tiến trình thấp hơn) */
const STATUS_WEIGHT: Record<string, number> = {
  [OrderStatus.Pending]: 0,
  [OrderStatus.Processing]: 1,
  [OrderStatus.Delivered]: 2,
  [OrderStatus.Paid]: 3,
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

/**
 * Xác định step hiện tại dựa trên trạng thái **thấp nhất** của tất cả orders.
 *
 * Logic: Trạng thái tổng hợp = trạng thái item "chậm nhất" (chưa tính Rejected).
 * - Ví dụ: 2 Delivered + 1 Processing → step = Processing (bước 1)
 * - Tất cả Paid → step = Paid (bước 3, hoàn thành)
 * - Tất cả Rejected → trả về -1 (không hiển thị stepper)
 */
function computeCurrentStep(orders: { status: string }[]): number {
  // Lọc bỏ Rejected — chúng không nằm trong luồng tuyến tính
  const activeOrders = orders.filter(o => o.status !== OrderStatus.Rejected)

  if (activeOrders.length === 0) return -1 // Tất cả bị reject hoặc rỗng

  // Tìm trạng thái thấp nhất
  let minWeight = Infinity
  for (const order of activeOrders) {
    const weight = STATUS_WEIGHT[order.status]
    if (weight !== undefined && weight < minWeight) {
      minWeight = weight
    }
  }

  return minWeight === Infinity ? -1 : minWeight
}

// ── Component ───────────────────────────────────────────────────────────────────

/**
 * Stepper trực quan hiển thị tiến trình tổng thể đơn hàng của khách.
 *
 * Chỉ hiển thị khi có ít nhất 1 order không phải Rejected.
 * Trạng thái Rejected được hiển thị riêng bên dưới stepper (nếu có).
 */
export function OrderProgressStepper({ orders }: OrderProgressStepperProps) {
  const currentStep = computeCurrentStep(orders)
  const rejectedCount = orders.filter(o => o.status === OrderStatus.Rejected).length

  // Không hiển thị stepper nếu tất cả orders bị reject hoặc rỗng
  if (currentStep === -1 && rejectedCount === 0) return null

  return (
    <div className='mb-6 rounded-xl border bg-card p-4 shadow-sm' id='order-progress-stepper'>
      {/* Stepper chính */}
      {currentStep !== -1 && (
        <div className='flex items-center'>
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isLast = index === STEPS.length - 1

            return (
              <div key={step.key} className='flex flex-1 items-center'>
                {/* Step circle + label */}
                <div className='flex flex-col items-center gap-1.5'>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : isCurrent
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 ring-4 ring-orange-500/20 dark:text-orange-400'
                          : 'border-muted-foreground/20 bg-muted text-muted-foreground/40'
                    }`}
                  >
                    {isCompleted ? <Check className='h-4 w-4' /> : step.icon}
                  </div>
                  <span
                    className={`max-w-[5rem] text-center text-[11px] leading-tight font-medium transition-colors duration-300 ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isCurrent
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-muted-foreground/50'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className='mx-1 mt-[18px] h-0.5 flex-1 self-start'>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        index < currentStep ? 'bg-emerald-500' : 'bg-muted-foreground/15'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Thông báo đơn bị từ chối */}
      {rejectedCount > 0 && (
        <div
          className={`flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 ${currentStep !== -1 ? 'mt-4' : ''}`}
        >
          <span className='shrink-0 text-base'>⚠️</span>
          <span>
            {rejectedCount} món bị từ chối
            {rejectedCount < orders.length ? ' — các món còn lại đang được xử lý' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
