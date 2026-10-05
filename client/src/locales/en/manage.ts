import type { Translation } from '@/lib/i18n/types'
import type { manage as vi } from '../vi/manage'

export const manage = {
  dashboard: {
    title: 'Dashboard',
    description: 'Live operations and real-time restaurant overview',
    viewByTable: 'View by Table',
    viewByDish: 'View by Dish (Kanban)',
  },
  orders: {
    title: 'Order management',
    description: 'Track and process customer orders',
  },
  kitchen: {
    title: 'Kitchen (KDS)',
    description: 'Kitchen display system for order preparation — realtime updates',
    pending: 'Pending',
    processing: 'Cooking',
  },
  tables: {
    title: 'Table management',
    description: 'Manage dining tables and restaurant QR codes',
  },
  dishes: {
    title: 'Dish management',
    description: 'Manage restaurant menu dishes',
  },
  staffs: {
    title: 'Staff management',
    description: 'Manage restaurant staff accounts',
  },
  analytics: {
    title: 'Analytics & Reports',
    description: 'Revenue, order statistics, and dish rankings by date range',
  },
} satisfies Translation<typeof vi>
