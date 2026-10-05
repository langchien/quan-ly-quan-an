import { Role } from '@app/shared'
import { useAuthStore } from '@/store/useAuthStore'
import { Link } from '@tanstack/react-router'
import { AppBrand } from './app-brand'
import { ModeToggle } from './mode-toggle'
import { Card } from './ui/card'

export function NavItems() {
  const accessToken = useAuthStore(s => s.accessToken)
  const guest = useAuthStore(s => s.guest)

  const isGuestLoggedIn = accessToken && guest?.role === Role.Guest
  const isStaffLoggedIn = accessToken && guest?.role !== Role.Guest

  if (isGuestLoggedIn) {
    // Guest đã đăng nhập: Gọi món & Đơn hàng
    return (
      <>
        <Link to='/menu' className='[&.active]:text-foreground' activeOptions={{ exact: true }}>
          Gọi món
        </Link>
        <Link to='/orders' className='[&.active]:text-foreground'>
          Đơn hàng
        </Link>
      </>
    )
  }

  if (isStaffLoggedIn) {
    // Owner/Employee: Quản lý
    return (
      <Link to='/manage/dashboard' className='[&.active]:text-foreground'>
        Quản lý
      </Link>
    )
  }

  // Chưa đăng nhập
  return (
    <>
      <Link to='/menu' className='[&.active]:text-foreground'>
        Món ăn
      </Link>
      <Link to='/login' className='[&.active]:text-foreground'>
        Đăng nhập
      </Link>
      <Link to='/signup' className='[&.active]:text-foreground'>
        Đăng ký
      </Link>
    </>
  )
}

export function PublicHeader() {
  return (
    <Card className='fixed z-10 h-20 w-full rounded-none'>
      <div className='container mx-auto flex h-20 items-center gap-3 px-4'>
        <Link to='/' className='shrink-0 transition-opacity hover:opacity-90 sm:mr-6 lg:mr-10'>
          <AppBrand showModeToggle={false} />
        </Link>
        <div className='scrollbar-hide flex min-w-0 flex-row items-center gap-4 overflow-x-auto text-sm font-semibold whitespace-nowrap text-muted-foreground sm:gap-6'>
          <NavItems />
        </div>
        <div className='ms-auto shrink-0'>
          <ModeToggle />
        </div>
      </div>
    </Card>
  )
}
