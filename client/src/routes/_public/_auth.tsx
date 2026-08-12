import { useAuthStore } from '@/store/useAuthStore'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/_auth')({
  beforeLoad: () => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <Outlet />
      </div>
    </div>
  )
}
