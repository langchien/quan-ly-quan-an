import * as en from '@/locales/en'
import * as ja from '@/locales/ja'
import * as vi from '@/locales/vi'

export const resources = { vi, en, ja } as const

export type AppResources = typeof vi
