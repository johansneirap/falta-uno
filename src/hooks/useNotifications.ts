import { useState } from 'react'
import { supabase } from '../lib/supabase'

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  game_id: string | null
  read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchNotifications(userId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, game_id, read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    setLoading(false)
    setNotifications((data ?? []) as AppNotification[])
  }

  async function markAllRead(userId: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markOneRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, loading, unreadCount, fetchNotifications, markAllRead, markOneRead }
}
