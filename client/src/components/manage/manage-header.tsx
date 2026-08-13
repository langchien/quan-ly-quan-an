import { Link, useLocation } from '@tanstack/react-router'
import * as React from 'react'

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

const routeTitles: Record<string, string> = {
  manage: 'Quản lý',
  dashboard: 'Bảng điều khiển',
  dishes: 'Quản lý Món ăn',
  oders: 'Quản lý Đơn hàng',
  orders: 'Quản lý Đơn hàng',
  staffs: 'Quản lý Nhân viên',
  tables: 'Quản lý Bàn ăn',
  analytics: 'Báo cáo & Thống kê',
  setting: 'Cài đặt',
  settings: 'Cài đặt',
}

export function ManageHeader() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const breadcrumbs = React.useMemo(() => {
    const items: Array<{ title: string; href: string; isLast: boolean }> = []
    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const formattedTitle =
        routeTitles[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1)
      const isLast = index === pathSegments.length - 1

      items.push({
        title: formattedTitle,
        href: currentPath,
        isLast,
      })
    })

    return items
  }, [pathSegments])

  return (
    <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link to={item.href} />}>{item.title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
