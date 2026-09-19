import { DishListSection } from '@/components/home/dish-list-section'
import { HeroSection } from '@/components/home/hero-section'
import { dishListQueryOptions } from '@/queries/use-dish'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(dishListQueryOptions)
  },
  component: HomePage,
})

function HomePage() {
  return (
    <main className='min-h-screen pt-20'>
      <HeroSection />
      <DishListSection />
    </main>
  )
}
