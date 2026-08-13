'use client'

import * as React from 'react'
import { UtensilsCrossedIcon } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

function useSidebarState() {
  try {
    return useSidebar()
  } catch {
    return { state: 'expanded' as const, isMobile: false }
  }
}

export interface AppBrandProps {
  brandName?: string
  subtitle?: string
  logo?: React.ReactNode
  showModeToggle?: boolean
  inSidebar?: boolean
  className?: string
}

export function AppBrand({
  brandName = 'Quản Lý Quán Ăn',
  subtitle = 'Hệ thống quản lý',
  logo,
  showModeToggle = true,
  inSidebar = false,
  className,
}: AppBrandProps) {
  const { state } = useSidebarState()

  const brandContent = (
    <div className={cn('flex items-center gap-3', className)}>
      <div className='flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm'>
        {logo || <UtensilsCrossedIcon className='size-5' />}
      </div>
      <div className='grid text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
        <span className='truncate font-semibold text-foreground'>{brandName}</span>
        <span className='truncate text-xs text-muted-foreground'>{subtitle}</span>
      </div>
    </div>
  )

  if (inSidebar) {
    return (
      <SidebarMenu>
        <SidebarMenuItem className='flex items-center justify-between gap-2'>
          <SidebarMenuButton
            size='lg'
            className='flex-1 cursor-default hover:bg-transparent active:bg-transparent data-[state=open]:bg-transparent'
          >
            <div className='flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm'>
              {logo || <UtensilsCrossedIcon className='size-5' />}
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
              <span className='truncate font-semibold text-foreground'>{brandName}</span>
              <span className='truncate text-xs text-muted-foreground'>{subtitle}</span>
            </div>
          </SidebarMenuButton>

          {showModeToggle && state !== 'collapsed' && (
            <div className='shrink-0 group-data-[collapsible=icon]:hidden'>
              <ModeToggle />
            </div>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <div className='flex items-center gap-3'>
      {brandContent}
      {showModeToggle && (
        <div className='ml-auto shrink-0'>
          <ModeToggle />
        </div>
      )}
    </div>
  )
}
