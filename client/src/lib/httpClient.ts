import { envConfig } from '@/envConfig'
import type { RefreshTokenResType } from '@/schemaValidations/auth.schema'
import { useAuthStore } from '@/store/useAuthStore'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'

type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

// Custom Error Classes ─────────────────────────────────────────────────────

export class HttpError extends Error {
  status: number
  payload: any
  constructor({
    status,
    payload,
    message = 'Lỗi HTTP',
  }: {
    status: number
    payload: any
    message?: string
  }) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export class EntityError extends HttpError {
  declare status: 422
  declare payload: EntityErrorPayload
  constructor(payload: EntityErrorPayload) {
    super({ status: 422, payload, message: 'Lỗi thực thể' })
  }
}

/**
 * Refresh Token Queue
 * Dùng để tránh race condition khi nhiều request cùng bị 401 đồng thời.
 * Thay vì gọi /auth/refresh nhiều lần, chúng ta cho các request "xếp hàng"
 * chờ đến khi refresh xong, rồi retry tất cả cùng lúc.
 */
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// Axios Instance
const axiosInstance = axios.create({
  baseURL: envConfig.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor – tự động đính kèm token
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Đọc accessToken từ Zustand Store (persist tự đồng bộ với localStorage)
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  // Với FormData, axios tự bỏ Content-Type để browser tự đặt boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Response Interceptor – xử lý lỗi 422 & 401 (refresh token)
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    if (error.response?.status === 422) {
      throw new EntityError(error.response.data as EntityErrorPayload)
    }

    // ── 401 Unauthorized → thử refresh access token ──
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh rồi thì đưa request vào queue chờ
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(newToken => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { refreshToken, guest } = useAuthStore.getState()
        if (!refreshToken) throw new Error('Không có refresh token')

        // ── Chọn đúng endpoint theo role ──
        // Guest dùng /guest/auth/refresh-token
        // Owner/Employee dùng /auth/refresh-token
        const isGuest = guest?.role === 'Guest'
        const refreshUrl = isGuest
          ? `${envConfig.VITE_API_URL}/guest/auth/refresh-token`
          : `${envConfig.VITE_API_URL}/auth/refresh-token`

        // Dùng axios thuần (không qua axiosInstance) để tránh vòng lặp interceptor
        const { data } = await axios.post<RefreshTokenResType>(refreshUrl, { refreshToken })

        const newAccessToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken

        // Cập nhật token mới vào Zustand Store
        // persist middleware tự đồng bộ vào localStorage
        useAuthStore
          .getState()
          .setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken })

        // Mở khoá và retry tất cả request đang chờ trong queue
        processQueue(null, newAccessToken)

        // Retry request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh thất bại → từ chối tất cả request trong queue
        processQueue(refreshError, null)

        // Xoá token khỏi Store (persist tự xoá localStorage)
        const wasGuest = useAuthStore.getState().guest?.role === 'Guest'
        useAuthStore.getState().logout()

        // Redirect đúng trang theo role:
        // Guest → trang chủ (không có trang login riêng)
        // Staff/Owner → trang login nhân viên
        window.location.href = wasGuest ? '/' : '/login'

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const httpClient = {
  get<T>(url: string, config?: object) {
    return axiosInstance.get<T>(url, config)
  },
  post<T>(url: string, data?: any, config?: object) {
    return axiosInstance.post<T>(url, data, config)
  },
  put<T>(url: string, data?: any, config?: object) {
    return axiosInstance.put<T>(url, data, config)
  },
  delete<T>(url: string, config?: object) {
    return axiosInstance.delete<T>(url, config)
  },
}
