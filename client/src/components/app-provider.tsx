import { socket } from '@/lib/socket'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/useAuthStore'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'

/**
 * Kết nối socket khi đã có accessToken (cho cả Guest lẫn Quản lý/Nhân viên).
 * Ngắt kết nối khi token bị xóa (logout).
 */
function SocketManager() {
  const accessToken = useAuthStore(s => s.accessToken)

  useEffect(() => {
    if (accessToken) {
      // Cập nhật auth token và kết nối
      socket.auth = { Authorization: `Bearer ${accessToken}` }
      if (!socket.connected) {
        socket.connect()
      }
    } else {
      // Chưa đăng nhập → ngắt kết nối
      if (socket.connected) {
        socket.disconnect()
      }
    }

    return () => {
      // Cleanup: không disconnect ở đây để tránh ngắt kết nối khi re-render
    }
  }, [accessToken])

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
