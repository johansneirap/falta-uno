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
  const {
    unreadCount,
    fetchNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = useNotifications()
  const location = useLocation()

  // Fetch inicial y re-fetch en cada cambio de ruta
  useEffect(() => {
    if (user) fetchNotifications(user.id)
  }, [user, location.pathname])

  // Suscripción realtime — solo una vez al montar
  useEffect(() => {
    if (!user) return
    subscribeToNotifications(user.id)
    return () => unsubscribeFromNotifications()
  }, [user?.id])

  return (
    <div className="app-container">
      <main className="pb-safe-20 min-h-dvh">
        {children}
      </main>
      <Navbar unreadCount={unreadCount} />
    </div>
  )
}
