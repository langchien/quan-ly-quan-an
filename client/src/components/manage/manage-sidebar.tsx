'use client'

import * as React from 'react'

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
import type { AccountType } from '@/schemaValidations/account.schema'

export function ManageSidebar({
  user,
  ...props
}: { user: AccountType } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <AppBrand inSidebar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={manageNavLink} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
