/**
 * Kiểu dùng để đảm bảo bản dịch các ngôn ngữ khác có cùng cấu trúc key với bản gốc (vi).
 * Thiếu / thừa key → lỗi khi chạy `tsc`.
 */
export type Translation<T> = {
  [K in keyof T]: T[K] extends string ? string : Translation<T[K]>
}

export const SUPPORTED_LANGUAGES = ['vi', 'en', 'ja'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: AppLanguage = 'vi'
export const LANGUAGE_STORAGE_KEY = 'lang'

export function normalizeLanguage(lng?: string | null): AppLanguage {
  const base = (lng ?? '').toLowerCase().split('-')[0]
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base)
    ? (base as AppLanguage)
    : DEFAULT_LANGUAGE
}
