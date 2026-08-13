import { httpClient } from '@/lib/httpClient'
import { useAuthStore } from '@/store/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

function useLogoutMutation() {
  return useMutation({
    mutationFn: (refreshToken: string) =>
      httpClient.post('/auth/logout', {
        refreshToken,
      }),
  })
}
export function useLogout() {
  const logout = useAuthStore(state => state.logout)
  const router = useRouter()
  const refreshToken = useAuthStore(state => state.refreshToken)
  const logoutMutation = useLogoutMutation()
  const onLogout = async () => {
    if (logoutMutation.isPending) return
    try {
      if (refreshToken) await logoutMutation.mutateAsync(refreshToken)
    } finally {
      logout()
      router.navigate({ to: '/login' })
    }
  }
  return { onLogout }
}
