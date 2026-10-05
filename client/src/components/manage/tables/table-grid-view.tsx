import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { envConfig } from '@/envConfig'
import type { TableSchema } from '@app/shared'
import { LayoutGrid, Link, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import type { z } from 'zod'

function getStatusConfig(status: string) {
  switch (status) {
    case 'Available':
      return {
        label: 'Trống',
        emoji: '🟢',
        dotColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        borderColor: 'border-emerald-500/20',
        ringColor: 'ring-emerald-500/30',
      }
    case 'Reserved':
      return {
        label: 'Đã đặt',
        emoji: '🟡',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-500/20',
        ringColor: 'ring-amber-500/30',
      }
    case 'Hidden':
      return {
        label: 'Ẩn',
        emoji: '🔴',
        dotColor: 'bg-red-500',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-500/20',
        ringColor: 'ring-red-500/30',
      }
    default:
      return {
        label: status,
        emoji: '',
        dotColor: 'bg-gray-500',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-700 dark:text-gray-400',
        borderColor: 'border-gray-500/20',
        ringColor: 'ring-gray-500/30',
      }
  }
}

interface TableGridViewProps {
  data: z.infer<typeof TableSchema>[]
  isLoading?: boolean
  onEdit: (table: z.infer<typeof TableSchema>) => void
  onDelete?: (table: z.infer<typeof TableSchema>) => void
  globalFilter: string
  statusFilter: string[]
}

function GridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} size='sm' className='animate-pulse'>
          <CardHeader>
            <Skeleton className='h-5 w-20' />
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-3'>
            <Skeleton className='size-24 rounded-md' />
            <div className='flex w-full gap-2'>
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-full' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TableGridView({
  data,
  isLoading,
  onEdit,
  onDelete,
  globalFilter,
  statusFilter,
}: TableGridViewProps) {
  if (isLoading) {
    return <GridSkeleton />
  }

  // Apply filters client-side (same logic as the data table)
  const filtered = data.filter(table => {
    // Global search filter
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      const matchNumber = String(table.number).toLowerCase().includes(q)
      const matchCapacity = String(table.capacity).toLowerCase().includes(q)
      if (!matchNumber && !matchCapacity) return false
    }
    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(table.status)) {
      return false
    }
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center'>
        <LayoutGrid className='size-10 text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          {globalFilter || statusFilter.length
            ? 'Không tìm thấy kết quả phù hợp'
            : 'Chưa có bàn nào'}
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {filtered.map(table => {
        const status = getStatusConfig(table.status)
        const url = `${envConfig.VITE_WEB_URL}/guest/tables/${table.number}?token=${table.token}`

        return (
          <Card
            key={table.number}
            size='sm'
            className={`group relative transition-all duration-200 hover:shadow-lg hover:ring-2 ${status.ringColor}`}
          >
            <CardHeader className='pb-0'>
              <CardTitle className='flex items-center gap-2'>
                <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary'>
                  {table.number}
                </span>
                <span className='text-base'>Bàn {table.number}</span>
              </CardTitle>

              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    id={`grid-table-actions-${table.number}`}
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon-sm',
                      className: 'data-[state=open]:bg-muted',
                    })}
                  >
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>Mở menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-40'>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(url)
                          toast.success('Đã sao chép đường dẫn bàn ăn')
                        }}
                      >
                        <Link className='mr-2 size-4' />
                        Sao chép URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(table)}>
                        <Pencil className='mr-2 size-4' />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(table)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='mr-2 size-4' />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>

            <CardContent className='flex flex-col items-center gap-3 pt-2'>
              {/* QR Code */}
              <div className='rounded-xl border bg-white p-2 shadow-sm transition-transform duration-200 group-hover:scale-105'>
                <QRCodeCanvas value={url} size={100} />
              </div>

              {/* Info badges */}
              <div className='flex w-full items-center justify-center gap-2'>
                <Badge variant='outline' className='gap-1.5'>
                  <Users className='size-3' />
                  {table.capacity} chỗ
                </Badge>
                <Badge
                  variant='outline'
                  className={`gap-1.5 ${status.bgColor} ${status.textColor} ${status.borderColor}`}
                >
                  <span className={`size-1.5 rounded-full ${status.dotColor}`} />
                  {status.label}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className='justify-center border-t pt-3'>
              <p className='text-xs text-muted-foreground'>
                Tạo ngày{' '}
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(table.createdAt))}
              </p>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
