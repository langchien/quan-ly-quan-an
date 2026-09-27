import { Role, type RoleType } from '@/constants/type'
import { Home, LineChart, Salad, ShoppingCart, Table, Users2, type LucideProps } from 'lucide-react'
import type React from 'react'

export type NavLinkItem = {
  title: string
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  href: string
  /** Nếu có, chỉ các role trong mảng mới thấy menu item này */
  requiredRoles?: RoleType[]
}

export const manageNavLink: NavLinkItem[] = [
  { title: 'Dashboard', href: '/manage/dashboard', Icon: Home },
  {
    title: 'Đơn hàng',
    href: '/manage/orders',
    Icon: ShoppingCart,
  },
  {
    title: 'Bàn ăn',
    href: '/manage/tables',
    Icon: Table,
  },
  {
    title: 'Món ăn',
    href: '/manage/dishes',
    Icon: Salad,
  },
  {
    title: 'Phân tích',
    href: '/manage/analytics',
    Icon: LineChart,
    requiredRoles: [Role.Owner],
  },
  {
    title: 'Nhân viên',
    href: '/manage/staffs',
    Icon: Users2,
    requiredRoles: [Role.Owner],
  },
]
