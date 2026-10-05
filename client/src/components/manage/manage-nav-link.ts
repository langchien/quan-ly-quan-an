import { Role, type RoleType } from '@app/shared'
import {
  ChefHat,
  Home,
  LineChart,
  Salad,
  ShoppingCart,
  Table,
  Users2,
  type LucideProps,
} from 'lucide-react'
import type React from 'react'

import type { common } from '@/locales/vi/common'

export type ManageNavKey = keyof typeof common.manageNav

export type NavLinkItem = {
  /** Key dịch trong namespace `common` → `manageNav.*` */
  titleKey: ManageNavKey
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  href: string
  /** Nếu có, chỉ các role trong mảng mới thấy menu item này */
  requiredRoles?: RoleType[]
}

export const manageNavLink: NavLinkItem[] = [
  { titleKey: 'dashboard', href: '/manage/dashboard', Icon: Home },
  {
    titleKey: 'orders',
    href: '/manage/orders',
    Icon: ShoppingCart,
  },
  {
    titleKey: 'kitchen',
    href: '/manage/kitchen',
    Icon: ChefHat,
  },
  {
    titleKey: 'tables',
    href: '/manage/tables',
    Icon: Table,
  },
  {
    titleKey: 'dishes',
    href: '/manage/dishes',
    Icon: Salad,
  },
  {
    titleKey: 'analytics',
    href: '/manage/analytics',
    Icon: LineChart,
    requiredRoles: [Role.Owner],
  },
  {
    titleKey: 'staffs',
    href: '/manage/staffs',
    Icon: Users2,
    requiredRoles: [Role.Owner],
  },
]
