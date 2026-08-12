import type { UseFormSetError } from 'react-hook-form'
import { toast } from 'sonner'
import { EntityError } from './httpClient'

export const handleErrorApi = ({
  error,
  setError,
}: {
  error: any
  setError?: UseFormSetError<any>
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach(item => {
      setError(item.field, {
        type: 'server',
        message: item.message,
      })
    })
  } else {
    toast.error(error?.payload?.message ?? 'Lỗi không xác định')
  }
}
