import { useState, useCallback } from 'react'
import { BellRing, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['guest', 'common'])
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

      toast.success(t('callStaff.success'), {
        description: t('callStaff.successDesc'),
      })

      setOpen(false)
      setMessage('')
      setCooldownUntil(Date.now() + COOLDOWN_MS)

      // Reset cooldown sau 30s
      setTimeout(() => setCooldownUntil(null), COOLDOWN_MS)
    } catch {
      toast.error(t('callStaff.failed'), {
        description: t('callStaff.failedDesc'),
      })
    } finally {
      setIsLoading(false)
    }
  }, [isCoolingDown, message, t])

  if (isCoolingDown) {
    return (
      <Button
        variant='outline'
        size={iconOnly ? 'icon' : 'default'}
        disabled
        className={`gap-2 border-brand/40 text-brand-soft-foreground ${className ?? ''}`}
        id='call-staff-btn'
        title={t('callStaff.waitTitle', { seconds: remainingSeconds })}
      >
        <BellRing className='h-4 w-4' />
        {!iconOnly && t('callStaff.wait', { seconds: remainingSeconds })}
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
            title={t('callStaff.button')}
          >
            <BellRing className='h-4 w-4' />
            {!iconOnly && t('callStaff.button')}
          </Button>
        }
      />

      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BellRing className='h-5 w-5 text-brand' />
            {t('callStaff.button')}
          </DialogTitle>
          <DialogDescription>{t('callStaff.description')}</DialogDescription>
        </DialogHeader>

        <div className='py-2'>
          <Label htmlFor='call-staff-message' className='mb-2 block text-sm font-medium'>
            {t('callStaff.requestLabel')}{' '}
            <span className='font-normal text-muted-foreground'>{t('callStaff.optional')}</span>
          </Label>
          <Textarea
            id='call-staff-message'
            placeholder={t('callStaff.placeholder')}
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
            {t('common:actions.cancel')}
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
                {t('callStaff.calling')}
              </>
            ) : (
              <>
                <BellRing className='h-4 w-4' />
                {t('callStaff.callNow')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
