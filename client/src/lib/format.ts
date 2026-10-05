import { getIntlLocale } from '@/lib/i18n/use-locale'
import type { AppLanguage } from '@/lib/i18n/types'

/**
 * Format số tiền VND theo chuẩn locale hiện tại (hoặc locale/ngôn ngữ truyền vào).
 * Tiền tệ luôn giữ VND, cách phân cách số và vị trí ký hiệu theo ngôn ngữ (vi: 1.200.000 ₫, en: ₫1,200,000).
 *
 * @example formatCurrency(1200000) (vi) → "1.200.000 ₫"
 * @example formatCurrency(1200000) (en) → "₫1,200,000"
 */
export function formatCurrency(value: number, lng?: AppLanguage | string) {
  const locale = lng ? (lng === 'en' ? 'en-US' : lng === 'vi' ? 'vi-VN' : lng) : getIntlLocale()
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

/**
 * Alias cho formatCurrency — giữ tương thích ngược
 */
export const formatCurrencyVND = formatCurrency

/**
 * Format số tiền dạng rút gọn (dùng cho dashboard, KPI) theo Intl compact.
 * @example formatCurrencyCompact(1200000) (vi) → "1,2 Tr ₫"
 * @example formatCurrencyCompact(1200000) (en) → "₫1.2M"
 * @example formatCurrencyCompact(500000) (vi) → "500 N ₫"
 * @example formatCurrencyCompact(500000) (en) → "₫500K"
 */
export function formatCurrencyCompact(value: number, lng?: AppLanguage | string): string {
  const locale = lng ? (lng === 'en' ? 'en-US' : lng === 'vi' ? 'vi-VN' : lng) : getIntlLocale()
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}

// Text Utilities

/**
 * Loại bỏ dấu tiếng Việt (diacritics) để hỗ trợ tìm kiếm.
 * Sử dụng Unicode NFD decomposition + strip combining marks.
 * Xử lý riêng đ/Đ vì không phải combining mark.
 *
 * @example removeDiacritics('Phở bò') → 'pho bo'
 * @example removeDiacritics('Bánh mì') → 'banh mi'
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strip combining diacritical marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
