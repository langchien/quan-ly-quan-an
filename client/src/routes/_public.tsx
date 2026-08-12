import { PublicHeader } from '@/components/public-header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  )
}
