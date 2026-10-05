import { Link, useLocation } from '@tanstack/react-router'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/language-switcher'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import type { common } from '@/locales/vi/common'

type BreadcrumbKey = keyof typeof common.breadcrumb

/** Map segment URL → key dịch `common:breadcrumb.*` */
const routeTitleKeys: Record<string, BreadcrumbKey> = {
  manage: 'manage',
  dashboard: 'dashboard',
  dishes: 'dishes',
  oders: 'orders',
  orders: 'orders',
  kitchen: 'kitchen',
  staffs: 'staffs',
  tables: 'tables',
  analytics: 'analytics',
  setting: 'settings',
  settings: 'settings',
}

export function ManageHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const breadcrumbs = React.useMemo(() => {
    const items: Array<{ title: string; href: string; isLast: boolean }> = []
    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const key = routeTitleKeys[segment.toLowerCase()]
      const formattedTitle = key
        ? t(`breadcrumb.${key}`)
        : segment.charAt(0).toUpperCase() + segment.slice(1)
      const isLast = index === pathSegments.length - 1

      items.push({
        title: formattedTitle,
        href: currentPath,
        isLast,
      })
    })

    return items
  }, [pathSegments, t])

  return (
    <header className='flex h-14 shrink-0 items-center gap-2 border-b px-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-16 sm:px-4'>
      <div className='flex min-w-0 items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
        <Breadcrumb>
          <BreadcrumbList className='flex-nowrap'>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && (
                  <BreadcrumbSeparator className={item.isLast ? '' : 'hidden sm:block'} />
                )}
                {/* Mobile: chỉ hiển thị mục hiện tại để không tràn header */}
                <BreadcrumbItem className={item.isLast ? 'min-w-0' : 'hidden sm:inline-flex'}>
                  {item.isLast ? (
                    <BreadcrumbPage className='truncate'>{item.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link to={item.href} />}>{item.title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className='ms-auto flex shrink-0 items-center gap-2'>
        <LanguageSwitcher />
        <ModeToggle />
      </div>
    </header>
  )
}
