import { socket } from '@/lib/socket'
import { queryClient } from '@/lib/queryClient'
import { Role } from '@/constants/type'
import { useAuthStore } from '@/store/useAuthStore'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'

/**
 * Kết nối socket khi Guest đã có accessToken và đúng role.
 * Ngắt kết nối khi token bị xóa (logout).
 */
function SocketManager() {
  const accessToken = useAuthStore(s => s.accessToken)
  const guest = useAuthStore(s => s.guest)

  useEffect(() => {
    const isGuest = guest?.role === Role.Guest

    if (accessToken && isGuest) {
      // Cập nhật auth token và kết nối
      socket.auth = { Authorization: `Bearer ${accessToken}` }
      if (!socket.connected) {
        socket.connect()
      }
    } else {
      // Chưa đăng nhập hoặc không phải guest → ngắt kết nối
      if (socket.connected) {
        socket.disconnect()
      }
    }

    return () => {
      // Cleanup: không disconnect ở đây để tránh ngắt kết nối khi re-render
    }
  }, [accessToken, guest])

  return null
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketManager />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
