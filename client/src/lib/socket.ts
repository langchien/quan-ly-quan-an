import { envConfig } from '@/envConfig'
import { io } from 'socket.io-client'

/**
 * Socket.io client instance dùng chung toàn app.
 *
 * - autoConnect: false → chỉ kết nối sau khi Guest đăng nhập thành công
 * - auth sẽ được set động trước khi connect (trong app-provider)
 */
export const socket = io(envConfig.VITE_API_URL, {
  autoConnect: false,
})
