import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { socket } from '@/lib/socket'
import { useGuestLoginMutation } from '@/queries/use-guest'
import { useAuthStore } from '@/store/useAuthStore'
import { Role } from '@app/shared'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'

// Search params schema

const searchSchema = z.object({
  token: z.string().catch(''),
})

// Route

export const Route = createFileRoute('/_public/guest/tables/$tableNumber')({
  validateSearch: search => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    // Nếu không có token thì redirect về trang chủ
    if (!search.token) {
      throw redirect({ to: '/' })
    }
  },
  component: GuestLoginPage,
})

// Component

function GuestLoginPage() {
  const { t } = useTranslation('auth')
  const { tableNumber } = Route.useParams()
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const setTokens = useAuthStore(s => s.setTokens)
  const setGuest = useAuthStore(s => s.setGuest)

  const [name, setName] = useState('')
  const loginMutation = useGuestLoginMutation()

  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(t('guestLogin.nameRequired'))
      return
    }

    try {
      const res = await loginMutation.mutateAsync({
        name: name.trim(),
        tableNumber: Number(tableNumber),
        token,
      })

      const { accessToken, refreshToken, guest } = res.data.data

      // Lưu token vào store
      setTokens({ accessToken, refreshToken })

      // Lưu thông tin guest
      setGuest({
        id: guest.id,
        name: guest.name,
        role: Role.Guest,
        tableNumber: guest.tableNumber,
      })

      // Kết nối socket với token mới
      socket.auth = { Authorization: `Bearer ${accessToken}` }
      socket.connect()

      toast.success(t('guestLogin.greeting', { name: guest.name }), {
        description: t('guestLogin.greetingDesc', { number: tableNumber }),
      })

      navigate({ to: '/menu' })
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6'>
      <Card className='w-full max-w-sm shadow-xl'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10'>
            <UtensilsCrossed className='h-7 w-7 text-primary' />
          </div>
          <CardTitle className='text-2xl'>{t('guestLogin.welcome')}</CardTitle>
          <CardDescription>
            <Trans
              ns='auth'
              i18nKey='guestLogin.description'
              values={{ number: tableNumber }}
              components={{ b: <span className='font-semibold text-foreground' /> }}
            />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='guest-name'>{t('guestLogin.nameLabel')}</Label>
              <Input
                id='guest-name'
                placeholder={t('guestLogin.namePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                maxLength={50}
                disabled={loginMutation.isPending}
              />
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loginMutation.isPending || !name.trim()}
              id='guest-login-btn'
            >
              {loginMutation.isPending ? t('guestLogin.entering') : t('guestLogin.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
