import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { AccountType } from '@app/shared'
import { Mail, MoreHorizontal, Pencil, Trash2, UserX } from 'lucide-react'
import { getInitials } from './staff-columns'

import { useStatusLabel, getRoleLabel as getDefaultRoleLabel } from '@/lib/status-label'
import { formatDate } from '@/lib/i18n/use-locale'
import { useTranslation } from 'react-i18next'

function getRoleConfig(role: string, getLabel?: (r: string) => string) {
  const label = getLabel ? getLabel(role) : getDefaultRoleLabel(role)
  switch (role) {
    case 'Owner':
      return {
        label,
        emoji: '👑',
        dotColor: 'bg-amber-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-500/20',
        ringColor: 'ring-amber-500/30',
        avatarBg: 'bg-amber-500/15',
        avatarText: 'text-amber-700 dark:text-amber-400',
      }
    case 'Employee':
      return {
        label,
        emoji: '👤',
        dotColor: 'bg-blue-500',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-500/20',
        ringColor: 'ring-blue-500/30',
        avatarBg: 'bg-blue-500/15',
        avatarText: 'text-blue-700 dark:text-blue-400',
      }
    default:
      return {
        label: role,
        emoji: '',
        dotColor: 'bg-gray-500',
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-700 dark:text-gray-400',
        borderColor: 'border-gray-500/20',
        ringColor: 'ring-gray-500/30',
        avatarBg: 'bg-gray-500/15',
        avatarText: 'text-gray-700 dark:text-gray-400',
      }
  }
}

interface StaffGridViewProps {
  data: AccountType[]
  isLoading?: boolean
  onEdit: (staff: AccountType) => void
  onDelete: (staff: AccountType) => void
  globalFilter: string
  roleFilter: string[]
}

function GridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} size='sm' className='animate-pulse'>
          <CardHeader>
            <Skeleton className='h-5 w-28' />
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-3'>
            <Skeleton className='size-20 rounded-full' />
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-6 w-24' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StaffGridView({
  data,
  isLoading,
  onEdit,
  onDelete,
  globalFilter,
  roleFilter,
}: StaffGridViewProps) {
  const { t } = useTranslation(['manage', 'common'])
  const { getRoleLabel } = useStatusLabel()

  if (isLoading) {
    return <GridSkeleton />
  }

  // Apply filters client-side (same logic as the data table)
  const filtered = data.filter(staff => {
    // Global search filter
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      const matchName = staff.name.toLowerCase().includes(q)
      const matchEmail = staff.email.toLowerCase().includes(q)
      if (!matchName && !matchEmail) return false
    }
    // Role filter
    if (roleFilter.length > 0 && !roleFilter.includes(staff.role)) {
      return false
    }
    return true
  })

  if (filtered.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center'>
        <UserX className='size-10 text-muted-foreground/40' />
        <p className='text-sm text-muted-foreground'>
          {globalFilter || roleFilter.length
            ? t('common:table.noResults')
            : t('staffs.empty', { defaultValue: 'Chưa có nhân viên nào' })}
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {filtered.map(staff => {
        const role = getRoleConfig(staff.role, getRoleLabel)

        return (
          <Card
            key={staff.id}
            size='sm'
            className={`group relative transition-all duration-200 hover:shadow-lg hover:ring-2 ${role.ringColor}`}
          >
            <CardHeader className='pb-0'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {role.emoji} {role.label}
              </CardTitle>

              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    id={`grid-staff-actions-${staff.id}`}
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'icon-sm',
                      className: 'data-[state=open]:bg-muted',
                    })}
                  >
                    <MoreHorizontal className='size-4' />
                    <span className='sr-only'>{t('common:actions.openMenu')}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-40'>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{t('common:actions.actions')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(staff)}>
                        <Pencil className='mr-2 size-4' />
                        {t('common:actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(staff)}
                        className='text-destructive focus:text-destructive'
                      >
                        <Trash2 className='mr-2 size-4' />
                        {t('common:actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>

            <CardContent className='flex flex-col items-center gap-3 pt-2'>
              {/* Avatar */}
              <Avatar className='size-20 ring-2 ring-border ring-offset-2 ring-offset-background transition-transform duration-200 group-hover:scale-105'>
                <AvatarImage src={staff.avatar ?? undefined} alt={staff.name} />
                <AvatarFallback className={`text-lg font-bold ${role.avatarBg} ${role.avatarText}`}>
                  {getInitials(staff.name)}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <div className='text-center'>
                <p className='leading-tight font-semibold'>{staff.name}</p>
                <div className='mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground'>
                  <Mail className='size-3' />
                  <span className='max-w-[180px] truncate'>{staff.email}</span>
                </div>
              </div>

              {/* Role badge */}
              <Badge
                variant='outline'
                className={`gap-1.5 ${role.bgColor} ${role.textColor} ${role.borderColor}`}
              >
                <span className={`size-1.5 rounded-full ${role.dotColor}`} />
                {role.label}
              </Badge>
            </CardContent>

            <CardFooter className='justify-center border-t pt-3'>
              <p className='text-xs text-muted-foreground'>
                {formatDate(staff.createdAt)}
              </p>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

