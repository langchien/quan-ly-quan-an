import { useState } from 'react'
import { Moon, Sun, Monitor, BellRing, BellOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/components/theme-provider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { LANGUAGE_OPTIONS, useAppLanguage } from '@/components/language-switcher'

const SOUND_KEY = 'notification-sound-enabled'

function getSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'false'
  } catch {
    return true // Mặc định bật
  }
}

export function SettingsPreferencesTab() {
  const { t } = useTranslation(['settings', 'common'])
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useAppLanguage()
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
    labelKey: 'light' | 'dark' | 'system'
    Icon: React.FC<{ className?: string }>
  }[] = [
    { value: 'light', labelKey: 'light', Icon: Sun },
    { value: 'dark', labelKey: 'dark', Icon: Moon },
    { value: 'system', labelKey: 'system', Icon: Monitor },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* Ngôn ngữ */}
      <div className='flex flex-col gap-4'>
        <div>
          <p className='text-sm font-semibold'>{t('settings:preferences.language')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {t('settings:preferences.languageDesc')}
          </p>
        </div>

        {/* 2 nút chọn ngôn ngữ dạng card */}
        <div className='grid grid-cols-2 gap-2'>
          {LANGUAGE_OPTIONS.map(({ value, flag }) => (
            <button
              key={value}
              type='button'
              onClick={() => void setLanguage(value)}
              className={[
                'flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                language === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground',
              ].join(' ')}
            >
              <span className='text-lg leading-none'>{flag}</span>
              <span>{t(`common:language.${value}`)}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Giao diện */}
      <div className='flex flex-col gap-4'>
        <div>
          <p className='text-sm font-semibold'>{t('settings:preferences.appearance')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {t('settings:preferences.appearanceDesc')}
          </p>
        </div>

        {/* 3 nút chọn theme dạng card */}
        <div className='grid grid-cols-3 gap-2'>
          {themeOptions.map(({ value, labelKey, Icon }) => (
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
              {t(`common:theme.${labelKey}`)}
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
                {isDark
                  ? t('settings:preferences.usingDark')
                  : t('settings:preferences.usingLight')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {t('settings:preferences.toggleDarkHint')}
              </p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={handleToggleTheme} />
        </div>
      </div>

      <Separator />

      {/* Thông báo âm thanh */}
      <div className='flex flex-col gap-4'>
        <div>
          <p className='text-sm font-semibold'>{t('settings:preferences.notifications')}</p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {t('settings:preferences.notificationsDesc')}
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
              <p className='text-sm font-medium'>{t('settings:preferences.sound')}</p>
              <p className='text-xs text-muted-foreground'>
                {soundEnabled
                  ? t('settings:preferences.soundOn')
                  : t('settings:preferences.soundOff')}
              </p>
            </div>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={handleToggleSound} />
        </div>
      </div>
    </div>
  )
}
