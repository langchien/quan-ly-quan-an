import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useLogout } from '@/hooks/use-logout'
import { useAccountMe } from '@/queries/use-account'
import { useSettingsStore } from '@/store/useSettingsStore'
import { ChevronsUpDownIcon, LogOutIcon, LockIcon, PaletteIcon, UserCircleIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function NavUser({ ...props }: React.ComponentProps<typeof SidebarMenuItem>) {
  const { t } = useTranslation()
  const { data: user } = useAccountMe()
  const { isMobile } = useSidebar()
  const { onLogout } = useLogout()
  const { openSettings } = useSettingsStore()

  if (!user) return null

  // Chữ cái đầu của tên (vd: "Nguyễn Văn A" → "NA")
  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  return (
    <SidebarMenu>
      <SidebarMenuItem {...props}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size='lg' className='aria-expanded:bg-muted' />}
          >
            <Avatar>
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{user.name}</span>
              <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
            </div>
            <ChevronsUpDownIcon className='ml-auto size-4' />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-64'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            {/* Thông tin user – dùng DropdownMenuGroup bao để GroupLabel hoạt động đúng */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className='flex items-center gap-2 px-1 py-0.5'>
                  <Avatar className='size-9 rounded-lg'>
                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                    <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left leading-tight'>
                    <span className='truncate text-sm font-semibold text-foreground'>
                      {user.name}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Mục cài đặt */}
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openSettings('profile')}>
                <UserCircleIcon className='size-4' />
                {t('userMenu.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSettings('security')}>
                <LockIcon className='size-4' />
                {t('userMenu.changePassword')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSettings('preferences')}>
                <PaletteIcon className='size-4' />
                {t('userMenu.preferences')}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Đăng xuất */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={onLogout}
                className='text-destructive focus:bg-destructive/10 focus:text-destructive'
              >
                <LogOutIcon className='size-4' />
                {t('userMenu.logout')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
