import { DashboardMain } from '@/components/manage/dashboard/dashboard-main'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardMain />
}
