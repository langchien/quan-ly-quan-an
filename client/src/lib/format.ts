/**
 * Tiện ích format tiền tệ Việt Nam
 *
 * Gom tất cả hàm formatCurrency vào 1 file duy nhất
 * để tránh trùng lặp code giữa nhiều components.
 */

const vnFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

/**
 * Format số tiền đầy đủ theo chuẩn Việt Nam
 * @example formatCurrency(1200000) → "1.200.000 ₫"
 */
export function formatCurrency(value: number) {
  return vnFormatter.format(value)
}

/**
 * Alias cho formatCurrency — giữ tương thích ngược
 */
export const formatCurrencyVND = formatCurrency

/**
 * Format số tiền dạng rút gọn (dùng cho dashboard, KPI)
 * @example formatCurrencyCompact(1200000) → "1.2M"
 * @example formatCurrencyCompact(500000) → "500K"
 * @example formatCurrencyCompact(800) → "800"
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M'
  if (value >= 1_000) return Math.floor(value / 1_000) + 'K'
  return value.toLocaleString('vi-VN')
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
