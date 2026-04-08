import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth()
  const { unreadCount, fetchNotifications } = useNotifications()
  const location = useLocation()

  useEffect(() => {
    if (user) fetchNotifications(user.id)
  }, [user, location.pathname])

  return (
    <div className="app-container">
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      <Navbar unreadCount={unreadCount} />
    </div>
  )
}
