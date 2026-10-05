import { Role, type RoleType } from '@app/shared'
import { useAccountMe } from '@/queries/use-account'

/**
 * Hook lấy role của user hiện tại từ API /accounts/me.
 *
 * Trả về:
 * - `role`: Role string ('Owner' | 'Employee')
 * - `isOwner`: true nếu là Owner
 * - `isEmployee`: true nếu là Employee
 *
 * Data được cache bởi TanStack Query (staleTime = 5 phút).
 */
export function useRole() {
  const { data: account } = useAccountMe()
  const role: RoleType | null = account?.role ?? null

  return {
    role,
    isOwner: role === Role.Owner,
    isEmployee: role === Role.Employee,
  }
}
