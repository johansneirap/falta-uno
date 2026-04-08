import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'

const TYPE_ICON: Record<string, string> = {
  join: '🤙',
  game_edited: '✏️',
  game_cancelled: '❌',
  kicked: '🚫',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

export default function Notifications() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications, loading, unreadCount, fetchNotifications, markAllRead, markOneRead } = useNotifications()

  useEffect(() => {
    if (user) fetchNotifications(user.id)
  }, [user])

  async function handleTap(notifId: string, gameId: string | null, read: boolean) {
    if (!read) await markOneRead(notifId)
    if (gameId) navigate(`/partido/${gameId}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="font-display font-extrabold text-[24px] text-brutal-black">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => user && markAllRead(user.id)}
            className="font-body text-[13px] text-primary font-medium"
          >
            Marcar todas leídas
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 px-5 pt-2 pb-6 overflow-y-auto flex-1">
        {loading && (
          <div className="flex justify-center pt-12">
            <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <span className="text-5xl">🔔</span>
            <p className="font-display font-bold text-[16px] text-brutal-black">Sin notificaciones</p>
            <p className="font-body text-[13px] text-gray-400">
              Te avisaremos cuando alguien se una a tu partido o haya cambios.
            </p>
          </div>
        )}

        {!loading && notifications.map(n => (
          <button
            key={n.id}
            onClick={() => handleTap(n.id, n.game_id, n.read)}
            className={`w-full text-left flex items-start gap-3 rounded-[12px] border-2 border-black px-4 py-3
                        transition-all active:opacity-70
                        ${n.read ? 'bg-white' : 'bg-primary/10'}`}
          >
            <span className="text-[22px] flex-shrink-0 mt-0.5">
              {TYPE_ICON[n.type] ?? '🔔'}
            </span>
            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-[13px] text-brutal-black truncate">
                  {n.title}
                </span>
                <span className="font-body text-[11px] text-gray-400 flex-shrink-0">
                  {timeAgo(n.created_at)}
                </span>
              </div>
              <span className="font-body text-[12px] text-gray-500 leading-snug">{n.body}</span>
            </div>
            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
