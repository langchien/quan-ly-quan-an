import { httpClient } from '@/lib/httpClient'
import type { DashboardIndicatorResType } from '@app/shared'
import { useQuery } from '@tanstack/react-query'

export function useDashboardIndicator({
  fromDate,
  toDate,
  enabled = true,
}: {
  fromDate: Date | undefined
  toDate: Date | undefined
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ['indicators', 'dashboard', fromDate?.toISOString(), toDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (fromDate) params.set('fromDate', fromDate.toISOString())
      if (toDate) params.set('toDate', toDate.toISOString())
      const res = await httpClient.get<DashboardIndicatorResType>(
        `/indicators/dashboard?${params.toString()}`
      )
      return res.data.data
    },
    enabled: enabled && !!fromDate && !!toDate,
  })
}
