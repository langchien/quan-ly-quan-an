import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Button variant='outline' size='icon' onClick={toggleTheme} title={t('theme.toggle')}>
      <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
      <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
      <span className='sr-only'>{t('theme.toggle')}</span>
    </Button>
  )
}
