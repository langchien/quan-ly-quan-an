import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { z } from 'zod'

import { resources } from './resources'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  type AppLanguage,
} from './types'

/**
 * Đồng bộ các "side effect" phụ thuộc ngôn ngữ:
 * - Thuộc tính `lang` của thẻ <html> (accessibility, SEO, font hyphenation)
 * - Ngôn ngữ message lỗi mặc định của Zod (form validation)
 */
function syncLanguageSideEffects(lng: string) {
  const language = normalizeLanguage(lng)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
  }
  z.config(language === 'en' ? z.locales.en() : z.locales.vi())
}

// Khởi tạo ngay lập tức cho Zod và thẻ html
syncLanguageSideEffects(DEFAULT_LANGUAGE)

i18n.on('languageChanged', syncLanguageSideEffects)

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: DEFAULT_LANGUAGE,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    defaultNS: 'common',
    ns: Object.keys(resources[DEFAULT_LANGUAGE]),
    interpolation: { escapeValue: false },
    returnNull: false,
    detection: {
      // Ưu tiên lựa chọn đã lưu → ngôn ngữ trình duyệt → fallback 'vi'
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
      convertDetectedLanguage: lng => normalizeLanguage(lng),
    },
  })
  .then(() => {
    syncLanguageSideEffects(i18n.resolvedLanguage ?? i18n.language)
  })

/** Ngôn ngữ hiện tại đã chuẩn hoá ('vi' | 'en') – dùng ngoài React component */
export function getCurrentLanguage(): AppLanguage {
  return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language)
}

export function changeLanguage(lng: AppLanguage) {
  return i18n.changeLanguage(lng)
}

export { i18n }
export default i18n
export * from './types'
