import type { Locale } from 'date-fns'
import { enUS, ja, vi } from 'date-fns/locale'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getCurrentLanguage } from './index'
import { normalizeLanguage, type AppLanguage } from './types'

const INTL_LOCALES: Record<AppLanguage, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
}

const DATE_FNS_LOCALES: Record<AppLanguage, Locale> = {
  vi,
  en: enUS,
  ja,
}

export function getIntlLocale(lng: AppLanguage = getCurrentLanguage()) {
  return INTL_LOCALES[lng]
}

export function getDateFnsLocale(lng: AppLanguage = getCurrentLanguage()) {
  return DATE_FNS_LOCALES[lng]
}

export type DateInput = Date | string | number | null | undefined

export function formatDateTime(date: DateInput, lng?: AppLanguage) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat(getIntlLocale(lng), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDate(date: DateInput, lng?: AppLanguage) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat(getIntlLocale(lng), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatTime(date: DateInput, lng?: AppLanguage) {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat(getIntlLocale(lng), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Hook trả về locale hiện tại + các hàm format ngày giờ.
 * Component dùng hook này sẽ tự re-render khi đổi ngôn ngữ.
 */
export function useLocale() {
  const { i18n } = useTranslation()
  const language = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language)

  return useMemo(
    () => ({
      language,
      intlLocale: INTL_LOCALES[language],
      dateFnsLocale: DATE_FNS_LOCALES[language],
      formatDate: (d: DateInput) => formatDate(d, language),
      formatDateTime: (d: DateInput) => formatDateTime(d, language),
      formatTime: (d: DateInput) => formatTime(d, language),
    }),
    [language]
  )
}
