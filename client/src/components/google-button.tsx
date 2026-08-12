import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function GoogleButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant='outline' type='button' className={cn('w-full', className)} {...props}>
      <img src='/google.png' alt='Google' className='size-4' />
      {children}
    </Button>
  )
}
