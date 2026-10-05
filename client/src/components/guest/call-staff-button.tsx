import { useState, useCallback } from 'react'
import { BellRing, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { socket } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

/** Thời gian hồi chiêu sau khi gọi nhân viên (ms) */
const COOLDOWN_MS = 30_000

interface CallStaffButtonProps {
  /** Ẩn label chữ, chỉ hiện icon (dùng trong header) */
  iconOnly?: boolean
  className?: string
}

/**
 * Nút "Gọi nhân viên" dành cho trang guest.
 * Emit socket event 'call-staff' lên server → server forward tới Manager room.
 * Có cooldown 30s để tránh spam.
 */
export function CallStaffButton({ iconOnly = false, className }: CallStaffButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  const isCoolingDown = cooldownUntil != null && Date.now() < cooldownUntil
  const remainingSeconds = isCoolingDown ? Math.ceil((cooldownUntil - Date.now()) / 1000) : 0

  const handleCallStaff = useCallback(async () => {
    if (isCoolingDown) return

    setIsLoading(true)
    try {
      await new Promise<void>((resolve, reject) => {
        socket.emit('call-staff', { message: message.trim() || undefined }, (response: unknown) => {
          const res = response as { success?: boolean; error?: string } | null
          if (res?.error) {
            reject(new Error(res.error))
          } else {
            resolve()
          }
        })

        // Timeout 5s nếu server không ack
        setTimeout(() => reject(new Error('Timeout')), 5000)
      })

      toast.success('🔔 Đã gọi nhân viên!', {
        description: 'Nhân viên sẽ đến hỗ trợ bạn trong giây lát.',
      })

      setOpen(false)
      setMessage('')
      setCooldownUntil(Date.now() + COOLDOWN_MS)

      // Reset cooldown sau 30s
      setTimeout(() => setCooldownUntil(null), COOLDOWN_MS)
    } catch {
      toast.error('Gọi nhân viên thất bại', {
        description: 'Vui lòng thử lại hoặc gọi trực tiếp.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [isCoolingDown, message])

  if (isCoolingDown) {
    return (
      <Button
        variant='outline'
        size={iconOnly ? 'icon' : 'default'}
        disabled
        className={`gap-2 border-brand/40 text-brand-soft-foreground ${className ?? ''}`}
        id='call-staff-btn'
        title={`Vui lòng chờ ${remainingSeconds}s trước khi gọi lại`}
      >
        <BellRing className='h-4 w-4' />
        {!iconOnly && `Chờ ${remainingSeconds}s`}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant='outline'
            size={iconOnly ? 'icon' : 'default'}
            className={`gap-2 border-brand/40 text-brand-soft-foreground hover:border-brand hover:bg-brand-soft hover:text-brand-soft-foreground ${className ?? ''}`}
            id='call-staff-btn'
            title='Gọi nhân viên'
          >
            <BellRing className='h-4 w-4' />
            {!iconOnly && 'Gọi nhân viên'}
          </Button>
        }
      />

      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BellRing className='h-5 w-5 text-brand' />
            Gọi nhân viên
          </DialogTitle>
          <DialogDescription>
            Nhân viên sẽ đến hỗ trợ bạn ngay. Bạn có thể để lại yêu cầu cụ thể bên dưới.
          </DialogDescription>
        </DialogHeader>

        <div className='py-2'>
          <Label htmlFor='call-staff-message' className='mb-2 block text-sm font-medium'>
            Yêu cầu hỗ trợ <span className='font-normal text-muted-foreground'>(tuỳ chọn)</span>
          </Label>
          <Textarea
            id='call-staff-message'
            placeholder='Ví dụ: Cho thêm muỗng đũa, khăn ướt, nước chấm...'
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
            className='resize-none'
          />
          <p className='mt-1 text-right text-xs text-muted-foreground'>{message.length}/200</p>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
            Huỷ
          </Button>
          <Button
            onClick={handleCallStaff}
            disabled={isLoading}
            className='gap-2 bg-brand text-brand-foreground hover:bg-brand/90'
            id='confirm-call-staff-btn'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Đang gọi...
              </>
            ) : (
              <>
                <BellRing className='h-4 w-4' />
                Gọi ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
