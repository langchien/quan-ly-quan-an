import { Toaster } from '@/components/ui/sonner'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { AppProvider } from '@/components/app-provider'
import { ThemeProvider } from '@/components/theme-provider'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <ThemeProvider defaultTheme='system' storageKey='theme'>
        <AppProvider>
          <Outlet />
          <Toaster />
        </AppProvider>
      </ThemeProvider>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
