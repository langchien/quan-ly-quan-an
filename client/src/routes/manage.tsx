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
    return queryClient.ensureQueryData(accountMeQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <ManageSidebar />
      <SidebarInset>
        <ManageHeader />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <Outlet />
        </div>
      </SidebarInset>
      <SettingsDialog />
    </SidebarProvider>
  )
}
