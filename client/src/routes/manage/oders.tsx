import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/oders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/oders"!</div>
}
