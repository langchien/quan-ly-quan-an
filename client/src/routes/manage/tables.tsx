import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/tables')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/tables"!</div>
}
