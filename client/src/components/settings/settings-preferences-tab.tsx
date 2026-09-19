import { useState } from 'react'
import { Moon, Sun, Monitor, BellRing, BellOff } from 'lucide-react'

import { useTheme } from '@/components/theme-provider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const SOUND_KEY = 'notification-sound-enabled'

function getSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'false'
  } catch {
    return true // Mặc định bật
  }
}

export function SettingsPreferencesTab() {
  const { theme, setTheme } = useTheme()
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getSoundEnabled)

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  function handleToggleTheme(checked: boolean) {
    setTheme(checked ? 'dark' : 'light')
  }

  function handleToggleSound(checked: boolean) {
    setSoundEnabled(checked)
    try {
      localStorage.setItem(SOUND_KEY, String(checked))
    } catch {
      // ignore
    }
  }

  const themeOptions: {
    value: 'light' | 'dark' | 'system'
    label: string
    Icon: React.FC<{ className?: string }>
  }[] = [
    { value: 'light', label: 'Sáng', Icon: Sun },
    { value: 'dark', label: 'Tối', Icon: Moon },
    { value: 'system', label: 'Hệ thống', Icon: Monitor },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* Giao diện */}
      <div className='flex flex-col gap-4'>
        <div>
          <p className='text-sm font-semibold'>Giao diện</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>Chọn chủ đề hiển thị cho ứng dụng</p>
        </div>

        {/* 3 nút chọn theme dạng card */}
        <div className='grid grid-cols-3 gap-2'>
          {themeOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              type='button'
              onClick={() => setTheme(value)}
              className={[
                'flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                theme === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground',
              ].join(' ')}
            >
              <Icon className='size-5' />
              {label}
            </button>
          ))}
        </div>

        {/* Toggle nhanh Sáng/Tối */}
        <div className='flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3'>
          <div className='flex items-center gap-3'>
            {isDark ? (
              <Moon className='size-4 text-primary' />
            ) : (
              <Sun className='size-4 text-amber-500' />
            )}
            <div>
              <p className='text-sm font-medium'>
                {isDark ? 'Đang dùng chế độ Tối' : 'Đang dùng chế độ Sáng'}
              </p>
              <p className='text-xs text-muted-foreground'>Bật để chuyển sang chế độ Tối</p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={handleToggleTheme} />
        </div>
      </div>

      <Separator />

      {/* Thông báo âm thanh */}
      <div className='flex flex-col gap-4'>
        <div>
          <p className='text-sm font-semibold'>Thông báo</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            Cài đặt âm thanh và thông báo realtime
          </p>
        </div>

        <div className='flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3'>
          <div className='flex items-center gap-3'>
            {soundEnabled ? (
              <BellRing className='size-4 text-primary' />
            ) : (
              <BellOff className='size-4 text-muted-foreground' />
            )}
            <div>
              <p className='text-sm font-medium'>Âm thanh thông báo đơn mới</p>
              <p className='text-xs text-muted-foreground'>
                {soundEnabled
                  ? 'Phát tiếng chuông khi có đơn đặt món mới từ bàn'
                  : 'Tắt tiếng – chỉ hiện popup thông báo'}
              </p>
            </div>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={handleToggleSound} />
        </div>
      </div>
    </div>
  )
}
