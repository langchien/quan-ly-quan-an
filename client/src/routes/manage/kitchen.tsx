import { KitchenMain } from '@/components/manage/kitchen/kitchen-main'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/manage/kitchen')({
  component: RouteComponent,
})

function RouteComponent() {
  return <KitchenMain />
}
