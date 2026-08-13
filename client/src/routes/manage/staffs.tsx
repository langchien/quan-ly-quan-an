import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/staffs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/manage/accounts"!</div>
}
