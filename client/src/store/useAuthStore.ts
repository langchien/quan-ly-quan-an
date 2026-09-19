import { RoleValues } from '@/constants/type'
import z from 'zod'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Guest Type ────────────────────────────────────────────────────────────────

const GuestInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.enum(RoleValues),
  tableNumber: z.number().nullable(),
})

export type GuestInfoType = z.TypeOf<typeof GuestInfoSchema>

// ─── Store Types ───────────────────────────────────────────────────────────────

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  guest: GuestInfoType | null
}

interface AuthActions {
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setTokens: ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => void
  setGuest: (guest: GuestInfoType) => void
  clearGuest: () => void
  logout: () => void
}

type AuthStore = AuthState & AuthActions

/**
 * Kiểm tra user đã xác thực hay chưa (dùng bên ngoài React component).
 * Bên trong component dùng: `useAuthStore(state => !!state.accessToken)`
 */
export const isAuthenticated = () => Boolean(useAuthStore.getState().accessToken)

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      guest: null,

      setAccessToken: token => set({ accessToken: token }),

      setRefreshToken: token => set({ refreshToken: token }),

      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),

      setGuest: guest => set({ guest }),

      clearGuest: () => set({ guest: null }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          guest: null,
        }),
    }),
    {
      name: 'auth-storage', // Key trong localStorage
      // Chỉ persist token & guest info, bỏ qua các action function
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        guest: state.guest,
      }),
    }
  )
)
