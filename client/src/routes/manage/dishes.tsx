import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/dishes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/dishes"!</div>
}
