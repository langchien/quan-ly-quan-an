import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/analytics"!</div>
}
