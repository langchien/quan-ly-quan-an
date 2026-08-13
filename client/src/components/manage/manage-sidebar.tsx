'use client'

import { AppBrand } from '@/components/app-brand'
import { manageNavLink } from '@/components/manage/manage-nav-link'
import { NavMain } from '@/components/manage/nav-main'
import { NavUser } from '@/components/manage/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

export function ManageSidebar() {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <AppBrand inSidebar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={manageNavLink} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
