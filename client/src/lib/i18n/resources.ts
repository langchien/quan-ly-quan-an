import * as en from '@/locales/en'
import * as vi from '@/locales/vi'

export const resources = { vi, en } as const

export type AppResources = typeof vi
