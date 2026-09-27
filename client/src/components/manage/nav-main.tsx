import { Link, useRouterState } from '@tanstack/react-router'

import { type NavLinkItem } from '@/components/manage/manage-nav-link'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useRole } from '@/hooks/useRole'

export function NavMain({ items }: { items: NavLinkItem[] }) {
  const { location } = useRouterState()
  const { role } = useRole()

  // Lọc menu items theo role hiện tại
  const visibleItems = items.filter(item => {
    if (!item.requiredRoles) return true
    return role ? item.requiredRoles.includes(role) : false
  })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map(({ title, href, Icon }) => {
          const isActive = location.pathname.startsWith(href)
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton tooltip={title} isActive={isActive} render={<Link to={href} />}>
                <Icon />
                <span>{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
