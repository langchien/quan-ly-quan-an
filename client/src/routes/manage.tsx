import { ManageHeader } from '@/components/manage/manage-header'
import { ManageSidebar } from '@/components/manage/manage-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuthStore } from '@/store/useAuthStore'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manage')({
  beforeLoad: () => {
    const { accessToken } = useAuthStore.getState()
    if (!accessToken) {
      throw redirect({ to: '/login' })
    }
  },
  loader: () => {
    const user = useAuthStore.getState().user
    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useLoaderData()
  return (
    <SidebarProvider>
      <ManageSidebar user={user!} />
      <SidebarInset>
        <ManageHeader />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
