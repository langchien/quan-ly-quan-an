import { CheckIcon, LanguagesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { changeLanguage, normalizeLanguage, type AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export const LANGUAGE_OPTIONS: { value: AppLanguage; flag: string; short: string }[] = [
  { value: 'vi', flag: '🇻🇳', short: 'VI' },
  { value: 'en', flag: '🇺🇸', short: 'EN' },
]

/** Hook dùng chung cho mọi nơi cần đọc/đổi ngôn ngữ */
export function useAppLanguage() {
  const { i18n } = useTranslation()
  const language = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language)
  return { language, setLanguage: changeLanguage }
}

interface LanguageSwitcherProps {
  className?: string
  /** Hiện mã ngôn ngữ (VI/EN) cạnh icon */
  showLabel?: boolean
}

export function LanguageSwitcher({ className, showLabel = true }: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const { language, setLanguage } = useAppLanguage()
  const current = LANGUAGE_OPTIONS.find(o => o.value === language) ?? LANGUAGE_OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            size={showLabel ? 'default' : 'icon'}
            className={cn('gap-1.5', className)}
            title={t('language.switch')}
            aria-label={t('language.switch')}
            id='language-switcher'
          />
        }
      >
        <LanguagesIcon className='size-4' />
        {showLabel && <span className='text-xs font-semibold'>{current.short}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44 min-w-44'>
        {LANGUAGE_OPTIONS.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => void setLanguage(option.value)}
            id={`language-option-${option.value}`}
          >
            <span className='text-base leading-none'>{option.flag}</span>
            <span className='flex-1'>{t(`language.${option.value}`)}</span>
            {option.value === language && <CheckIcon className='size-4 text-primary' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
