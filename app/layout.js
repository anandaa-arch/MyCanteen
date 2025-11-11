'use client'

import { usePathname } from 'next/navigation'
import { useNotifications, NotificationContainer } from '@/lib/notificationSystem'
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary'

import './globals.css'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const { notifications, removeNotification } = useNotifications()

  // Routes where BottomNavbar should be hidden
  const hideOnRoutes = [
    '/',
    '/login',
    '/signup',
    '/admin/dashboard',
    '/admin/create-user',
    '/unauthorized'
  ]

  const showBottomBar = !hideOnRoutes.includes(pathname)

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased bg-gray-50">
        <GlobalErrorBoundary>
          <NotificationContainer 
            notifications={notifications} 
            onRemove={removeNotification} 
          />
          <main className="flex-grow w-full pb-16 sm:pb-20">{children}</main>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
