import { UtensilsCrossedIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function HeroSection() {
  const { t } = useTranslation('guest')

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
          {t('home.heroTitle')}{' '}
          <span className='bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent'>
            {t('home.heroHighlight')}
          </span>
        </h1>

        <p className='mx-auto max-w-xl text-base text-muted-foreground md:text-lg'>
          {t('home.heroDescription')}
        </p>
      </div>
    </section>
  )
}
