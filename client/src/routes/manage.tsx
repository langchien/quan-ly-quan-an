import { ManageHeader } from '@/components/manage/manage-header'
import { ManageSidebar } from '@/components/manage/manage-sidebar'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { accountMeQueryOptions } from '@/queries/use-account'
import { useAuthStore } from '@/store/useAuthStore'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage')({
  beforeLoad: () => {
    const { accessToken } = useAuthStore.getState()
    if (!accessToken) {
      throw redirect({ to: '/login' })
    }
  },
  loader: ({ context: { queryClient } }) => {
    return queryClient.query({ ...accountMeQueryOptions, staleTime: 'static' })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <ManageSidebar />
      <SidebarInset className='min-w-0 overflow-x-hidden'>
        <ManageHeader />
        <div className='flex min-w-0 flex-1 flex-col gap-4 p-3 pt-0 sm:p-4 sm:pt-0'>
          <Outlet />
        </div>
      </SidebarInset>
      {/* Dialog cài đặt – state quản lý bởi useSettingsStore, không cần prop */}
      <SettingsDialog />
    </SidebarProvider>
  )
}
