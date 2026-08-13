import { Link, useRouterState } from '@tanstack/react-router'

import { type NavLinkItem } from '@/components/manage/manage-nav-link'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({ items }: { items: NavLinkItem[] }) {
  const { location } = useRouterState()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(({ title, href, Icon }) => {
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
