import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'

export function InputPassword({ className, ...props }: React.ComponentProps<typeof Input>) {
  const { t } = useTranslation('auth')
  const [showPassword, setShowPassword] = useState(false)

  const toggleTitle = showPassword ? t('common.hidePassword') : t('common.showPassword')

  return (
    <ButtonGroup className='w-full'>
      <Input type={showPassword ? 'text' : 'password'} className={className} {...props} />
      <Button
        type='button'
        variant='outline'
        size='icon'
        onClick={() => setShowPassword(prev => !prev)}
        title={toggleTitle}
        aria-label={toggleTitle}
      >
        {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
      </Button>
    </ButtonGroup>
  )
}
