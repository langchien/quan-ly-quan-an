import i18n from '@/lib/i18n'
import { queryClient } from '@/lib/queryClient'
import { useLogoutMutation } from '@/queries/use-auth'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

export function useLogout() {
  const logout = useAuthStore(state => state.logout)
  const router = useRouter()
  const refreshToken = useAuthStore(state => state.refreshToken)
  const logoutMutation = useLogoutMutation()

  const onLogout = async () => {
    if (logoutMutation.isPending) return
    try {
      if (refreshToken) {
        await logoutMutation.mutateAsync({ refreshToken })
      }
    } finally {
      logout()
      queryClient.clear()
      toast.success(i18n.t('auth:logout.success'))
      router.navigate({ to: '/login' })
    }
  }

  return { onLogout }
}
