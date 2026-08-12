import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/dashboard"!</div>
}
