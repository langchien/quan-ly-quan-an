import * as React from 'react'
import { Lock, Palette, User } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { useSettingsStore, type SettingsTab } from '@/store/useSettingsStore'
import { SettingsProfileTab } from './settings-profile-tab'
import { SettingsSecurityTab } from './settings-security-tab'
import { SettingsPreferencesTab } from './settings-preferences-tab'

// ─── Cấu hình các Tab ────────────────────────────────────────────────────────
const TABS: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: 'profile',
    label: 'Hồ sơ',
    icon: User,
    description: 'Thông tin cá nhân & ảnh đại diện',
  },
  {
    id: 'security',
    label: 'Bảo mật',
    icon: Lock,
    description: 'Mật khẩu & quyền truy cập',
  },
  {
    id: 'preferences',
    label: 'Hệ thống',
    icon: Palette,
    description: 'Giao diện & thông báo',
  },
]

// ─── Nội dung từng tab ───────────────────────────────────────────────────────
function TabContent({ tab }: { tab: SettingsTab }) {
  switch (tab) {
    case 'profile':
      return <SettingsProfileTab />
    case 'security':
      return <SettingsSecurityTab />
    case 'preferences':
      return <SettingsPreferencesTab />
  }
}

// ─── Component chính ─────────────────────────────────────────────────────────
export function SettingsDialog() {
  const { open, activeTab, setOpen, setActiveTab } = useSettingsStore()

  const currentTab = TABS.find(t => t.id === activeTab) ?? TABS[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className='overflow-hidden p-0 md:max-h-[560px] md:max-w-[680px] lg:max-w-[760px]'
        showCloseButton={false}
      >
        <DialogTitle className='sr-only'>Cài đặt tài khoản</DialogTitle>
        <DialogDescription className='sr-only'>
          Cập nhật hồ sơ, đổi mật khẩu và tuỳ chỉnh hệ thống
        </DialogDescription>

        <SidebarProvider
          className='h-full items-start'
          style={{ '--sidebar-width': '200px' } as React.CSSProperties}
        >
          {/* ── Sidebar trái ── */}
          <Sidebar collapsible='none' className='hidden border-r md:flex'>
            <SidebarContent className='py-3'>
              {/* Tiêu đề nhỏ ở đầu sidebar */}
              <div className='px-4 pt-1 pb-2'>
                <p className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                  Cài đặt
                </p>
              </div>

              <SidebarGroup className='p-0'>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {TABS.map(tab => (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          render={<button type='button' />}
                          isActive={activeTab === tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className='mx-2 w-[calc(100%-16px)] rounded-lg'
                        >
                          <tab.icon className='size-4' />
                          <span>{tab.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* ── Phần nội dung chính ── */}
          <main className='flex h-full flex-1 flex-col overflow-hidden'>
            {/* Header của content area */}
            <header className='flex h-14 shrink-0 items-center justify-between border-b px-6'>
              <div>
                <p className='text-sm leading-tight font-semibold'>{currentTab.label}</p>
                <p className='text-xs text-muted-foreground'>{currentTab.description}</p>
              </div>
              {/* Nút đóng */}
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                aria-label='Đóng'
              >
                <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
                  <path
                    d='M1 1L13 13M13 1L1 13'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                  />
                </svg>
              </button>
            </header>

            {/* Tab content cuộn được */}
            <div className='flex-1 overflow-y-auto px-6 py-5'>
              {/* Mobile: Tab navigation nằm ngang */}
              <div className='mb-5 flex gap-1 overflow-x-auto md:hidden'>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    <tab.icon className='size-3.5' />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Nội dung tab */}
              <TabContent tab={activeTab} />
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
