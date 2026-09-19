import { UtensilsCrossedIcon } from 'lucide-react'

export function HeroSection() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-background'>
      {/* Decorative background circles */}
      <div className='pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-800/20' />
      <div className='pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-800/20' />

      <div className='relative container mx-auto px-4 text-center'>
        {/* Icon */}
        <div className='mb-6 inline-flex items-center justify-center rounded-2xl bg-orange-500 p-4 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30'>
          <UtensilsCrossedIcon className='size-10' />
        </div>

        {/* Heading */}
        <h1 className='mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl'>
          Thực đơn{' '}
          <span className='bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent'>
            hôm nay
          </span>
        </h1>

        <p className='mx-auto max-w-xl text-base text-muted-foreground md:text-lg'>
          Khám phá những món ăn ngon được chế biến tươi mới mỗi ngày. Chọn món yêu thích và thưởng
          thức ngay!
        </p>
      </div>
    </section>
  )
}
