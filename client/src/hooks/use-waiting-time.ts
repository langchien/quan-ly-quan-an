import { useEffect, useState } from 'react'
import { formatTime } from '@/lib/i18n/use-locale'
import i18n from '@/lib/i18n'

/**
 * Hook đếm thời gian chờ kể từ `createdAt` (ISO string hoặc Date).
 * Trả về chuỗi dạng "Xp Ys" hoặc "Xg Yp" (nếu quá 1 giờ).
 * Cập nhật mỗi giây.
 */
export function useWaitingTime(createdAt: string | Date) {
  const [elapsed, setElapsed] = useState(() => calcElapsed(createdAt))

  useEffect(() => {
    const handleUpdate = () => setElapsed(calcElapsed(createdAt))
    handleUpdate()

    const interval = setInterval(handleUpdate, 1000)
    i18n.on('languageChanged', handleUpdate)

    return () => {
      clearInterval(interval)
      i18n.off('languageChanged', handleUpdate)
    }
  }, [createdAt])

  return elapsed
}

function calcElapsed(createdAt: string | Date) {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - created)

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return {
      text: i18n.t('guest:waiting.hoursMinutes', { hours, minutes }),
      minutes: hours * 60 + minutes,
      isLong: true,
    }
  }
  return {
    text: i18n.t('guest:waiting.minutesSeconds', {
      minutes,
      seconds: seconds.toString().padStart(2, '0'),
    }),
    minutes,
    isLong: minutes >= 15,
  }
}

/**
 * Hiển thị thời gian đặt dạng "HH:mm"
 */
export function formatOrderTime(createdAt: string | Date) {
  return formatTime(createdAt)
}
