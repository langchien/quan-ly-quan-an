import { useAuthStore } from '@/store/useAuthStore'
import { Link } from '@tanstack/react-router'
import { AppBrand } from './app-brand'
import { ModeToggle } from './mode-toggle'
import { Card } from './ui/card'

type Show = 'all' | 'authRequired' | 'authNone'
interface MenuItem {
  title: string
  href: string
  show: Show
}
const menuItems: MenuItem[] = [
  {
    title: 'Món ăn',
    href: '/menu',
    show: 'all',
  },
  {
    title: 'Đơn hàng',
    href: '/orders',
    show: 'all',
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    show: 'authRequired',
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    show: 'authNone',
  },
  {
    title: 'Đăng ký',
    href: '/signup',
    show: 'authNone',
  },
]
export function NavItems() {
  const isAuthenticated = useAuthStore(state => state.accessToken)
  return menuItems
    .filter(
      item =>
        item.show === 'all' ||
        (item.show === 'authRequired' && isAuthenticated) ||
        (item.show === 'authNone' && !isAuthenticated)
    )
    .map(item => (
      <Link to={item.href} key={item.href}>
        {item.title}
      </Link>
    ))
}

export function PublicHeader() {
  return (
    <Card className='fixed z-10 h-20 w-full rounded-none'>
      <div className='container mx-auto flex h-20 items-center'>
        <Link to='/' className='mr-10 transition-opacity hover:opacity-90'>
          <AppBrand showModeToggle={false} />
        </Link>
        <div className='flex-row space-x-6 text-sm font-semibold text-muted-foreground'>
          <NavItems />
        </div>
        <div className='ms-auto'>
          <ModeToggle />
        </div>
      </div>
    </Card>
  )
}
