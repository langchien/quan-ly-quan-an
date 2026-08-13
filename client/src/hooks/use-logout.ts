import { queryClient } from '@/lib/queryClient'
import { useLogoutMutation } from '@/queries/use-auth'
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from '@tanstack/react-router'

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
      router.navigate({ to: '/login' })
    }
  }

  return { onLogout }
}

