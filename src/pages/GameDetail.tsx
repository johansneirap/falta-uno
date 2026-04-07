import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Avatar from '../components/ui/Avatar'
import type { Game, Sport } from '../lib/constants'
import { LEVEL_LABEL_MAP } from '../lib/constants'
import { useGames } from '../hooks/useGames'

const SPORT_EMOJI: Record<string, string> = {
  padel: '🎾', futbol: '⚽', tenis: '🎾', basket: '🏀',
}
const SPORT_LABEL: Record<string, string> = {
  padel: 'Pádel', futbol: 'Fútbol', tenis: 'Tenis', basket: 'Básket',
}
const FORMAT_LABEL: Record<string, string> = {
  dobles: 'Dobles', singles: 'Singles',
  '5v5': '5 vs 5', '7v7': '7 vs 7', '11v11': '11 vs 11', '3v3': '3 vs 3',
}

interface GameWithRelations extends Game {
  organizer: { id: string; name: string; phone: string | null }
}
interface JoinWithPlayer {
  user_id: string
  player: { id: string; name: string }
}

function formatDatetime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  }) + ' · ' + date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { cancelGame, completeGame } = useGames()

  const [game, setGame] = useState<GameWithRelations | null>(null)
  const [joins, setJoins] = useState<JoinWithPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [completing, setCompleting] = useState(false)

  const alreadyJoined = joins.some(j => j.user_id === user?.id)
  const isOrganizer = game?.created_by === user?.id
  const isFull = game?.status === 'full'

  async function handleCancelGame() {
    if (!game) return
    setCancelling(true)
    const { error } = await cancelGame(game.id)
    setCancelling(false)
    if (!error) navigate('/', { state: { cancelled: true } })
  }

  async function handleCompleteGame() {
    if (!game) return
    setCompleting(true)
    const { error } = await completeGame(game.id)
    setCompleting(false)
    if (!error) navigate('/', { state: { completed: true } })
  }

  useEffect(() => {
    if (!id) return
    loadGame()
  }, [id])

  async function loadGame() {
    setLoading(true)
    const [gameRes, joinsRes] = await Promise.all([
      supabase
        .from('games')
        .select('*, organizer:profiles!games_created_by_fkey(id, name, phone)')
        .eq('id', id)
        .single(),
      supabase
        .from('game_joins')
        .select('user_id, player:profiles!game_joins_user_id_fkey(id, name)')
        .eq('game_id', id),
    ])
    setLoading(false)
    setGame(gameRes.data as GameWithRelations)
    setJoins((joinsRes.data ?? []) as JoinWithPlayer[])
  }

  async function handleJoin() {
    if (!user || !game) return
    setJoining(true)
    setJoinError(null)
    const { error } = await supabase.rpc('join_game', {
      p_game_id: game.id,
      p_user_id: user.id,
    })
    setJoining(false)
    if (error) {
      setJoinError(error.message ?? 'No se pudo unir al partido')
    } else {
      await loadGame()
      // Notificar al organizador (fire and forget — no bloquea el flujo)
      supabase.functions.invoke('notify-join', { body: { game_id: game.id, joiner_id: user.id } })
      openWhatsApp()
    }
  }

  function openWhatsApp() {
    const phone = game?.organizer?.phone
    if (!phone) return
    const msg = encodeURIComponent(
      `¡Hola ${game?.organizer?.name}! Me uní a tu partido de ${SPORT_LABEL[game?.sport as Sport]} en Falta 1. ¡Nos vemos!`
    )
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen bg-cream">
        <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen bg-cream gap-4">
        <span className="text-5xl">🏟️</span>
        <p className="font-display font-bold text-brutal-black">Partido no encontrado</p>
        <button onClick={() => navigate('/')} className="font-display font-bold text-primary underline">
          Volver al inicio
        </button>
      </div>
    )
  }

  const emptySlots = Array.from({ length: game.slots_available })
  // Players confirmed outside the app (organizer already counted, app joins already counted)
  const dummyCount = Math.max(0, game.slots_total - game.slots_available - 1 - joins.length)

  return (
    <div className="app-container flex flex-col bg-cream min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="text-brutal-black">
          <ArrowLeftIcon />
        </button>
        <h1 className="font-display font-bold text-[18px] text-brutal-black">Detalle del Partido</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-5 px-5 pb-32 overflow-y-auto flex-1">

        {/* Hero Card */}
        <div className="bg-white border-[2.5px] border-black rounded-[12px] shadow-brutal overflow-hidden">
          {/* Sport banner */}
          <div className="bg-primary border-b-[2.5px] border-black px-5 py-4 flex items-center gap-3">
            <span className="text-[28px]">{SPORT_EMOJI[game.sport]}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-display font-bold text-[18px] text-black">
                {SPORT_LABEL[game.sport]} · {FORMAT_LABEL[game.format] ?? game.format}
              </span>
              <span className="font-display font-semibold text-[12px] text-black tracking-[1px]">
                {isFull ? 'COMPLETO' : 'ABIERTO'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 px-5 py-4">
            <div className="flex items-start gap-3">
              <MapPinIcon />
              <div className="flex flex-col gap-0.5">
                <span className="font-body font-semibold text-[13px] text-brutal-black">{game.location_text}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarIcon />
              <span className="font-body text-[13px] text-brutal-black capitalize">{formatDatetime(game.datetime)}</span>
            </div>
            <div className="flex items-start gap-3">
              <SignalIcon />
              <span className="font-body text-[13px] text-brutal-black">{LEVEL_LABEL_MAP[game.level_required] ?? game.level_required}</span>
            </div>
          </div>

          <div className="h-[1px] bg-black mx-0" />

          {/* Players section */}
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-[16px] text-brutal-black">Jugadores</span>
              <span className="bg-primary border-[2px] border-black rounded-full px-2.5 py-1 font-display font-bold text-[12px]">
                {game.slots_total - game.slots_available} / {game.slots_total}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Organizador */}
              <div className="flex items-center gap-3 bg-secondary/20 border-2 border-black rounded-[10px] p-3">
                <Avatar name={game.organizer?.name ?? '?'} size="sm" />
                <div className="flex flex-col">
                  <span className="font-display font-bold text-[13px] text-brutal-black">
                    {game.organizer?.name ?? 'Organizador'}
                  </span>
                  <span className="font-body text-[11px] text-gray-500">Organizador</span>
                </div>
              </div>

              {/* Jugadores confirmados fuera de la app */}
              {Array.from({ length: dummyCount }).map((_, i) => (
                <div key={`dummy-${i}`} className="flex items-center gap-3 bg-secondary/20 border-2 border-black rounded-[10px] p-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-[11px] text-gray-500">J{i + 2}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-[13px] text-brutal-black">Jugador {i + 2}</span>
                    <span className="font-body text-[11px] text-gray-400">Confirmado</span>
                  </div>
                </div>
              ))}

              {/* Jugadores unidos por la app */}
              {joins.map(j => (
                <div key={j.user_id} className="flex items-center gap-3 bg-secondary/20 border-2 border-black rounded-[10px] p-3">
                  <Avatar name={j.player?.name ?? '?'} size="sm" />
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-[13px] text-brutal-black">
                      {j.player?.name ?? 'Jugador'}
                    </span>
                    <span className="font-body text-[11px] text-gray-400">Vía Falta 1</span>
                  </div>
                </div>
              ))}

              {/* Cupos vacíos */}
              {emptySlots.map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-cream border-2 border-gray-300 border-dashed rounded-[10px] p-3">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-300 text-lg">+</span>
                  </div>
                  <span className="font-body text-[13px] text-gray-400">Cupo disponible</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Organizer Card */}
        <div className="bg-white border-[2.5px] border-black rounded-[12px] shadow-[3px_3px_0px_0px_#000000] p-4 flex items-center gap-3">
          <Avatar name={game.organizer?.name ?? '?'} size="md" />
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="font-body font-semibold text-[15px] text-brutal-black">
              {game.organizer?.name ?? 'Organizador'}
            </span>
            <span className="font-body text-[12px] text-gray-500">Organizador del partido</span>
          </div>
          {!isOrganizer && game.organizer?.phone && (
            <button
              onClick={openWhatsApp}
              className="flex items-center gap-1.5 bg-[#25D366] border-2 border-black rounded-full px-3 py-2
                         font-display font-bold text-[12px] text-white
                         shadow-[2px_2px_0px_0px_#000000] transition-all active:shadow-none"
            >
              <ChatIcon />
              Chat
            </button>
          )}
        </div>

        {joinError && (
          <p className="font-body text-[13px] text-danger text-center">{joinError}</p>
        )}

        {/* Acciones organizador */}
        {isOrganizer && (
          <div className="bg-white border-[2.5px] border-black rounded-[12px] shadow-[3px_3px_0px_0px_#000000] p-4 flex flex-col gap-3">

            {/* Completar partido */}
            {game.status !== 'completed' && game.status !== 'cancelled' && (
              <button
                onClick={handleCompleteGame}
                disabled={completing}
                className="w-full h-11 flex items-center justify-center gap-2
                           bg-secondary border-2 border-black rounded-[10px]
                           font-display font-bold text-[14px] text-black
                           shadow-[3px_3px_0px_0px_#000000]
                           transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                           disabled:opacity-50"
              >
                {completing ? 'Guardando...' : '✅ Marcar como jugado'}
              </button>
            )}

            {/* Eliminar partido */}
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full h-11 flex items-center justify-center gap-2
                           bg-white border-2 border-danger rounded-[10px]
                           font-display font-bold text-[14px] text-danger
                           transition-all active:opacity-70"
              >
                <TrashIcon />
                Eliminar partido
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-body text-[13px] text-brutal-black text-center">
                  ¿Eliminar este partido? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 h-10 border-2 border-black rounded-[10px]
                               font-display font-bold text-[13px] text-brutal-black
                               transition-all active:opacity-70"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCancelGame}
                    disabled={cancelling}
                    className="flex-1 h-10 bg-danger border-2 border-black rounded-[10px]
                               font-display font-bold text-[13px] text-white
                               shadow-[3px_3px_0px_0px_#000000]
                               transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]
                               disabled:opacity-50"
                  >
                    {cancelling ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {!isOrganizer && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px]
                        bg-cream border-t-[2.5px] border-black px-5 pt-4 pb-8">
          {alreadyJoined ? (
            <div className="w-full h-[52px] flex items-center justify-center gap-2
                            bg-white border-2 border-black rounded-[14px]">
              <span className="text-xl">✅</span>
              <span className="font-display font-bold text-[15px] text-brutal-black">¡Ya estás en el partido!</span>
            </div>
          ) : isFull ? (
            <div className="w-full h-[52px] flex items-center justify-center
                            bg-white border-2 border-gray-300 rounded-[14px]">
              <span className="font-display font-bold text-[15px] text-gray-400">Partido completo</span>
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full h-[52px] flex items-center justify-center gap-2
                         bg-primary border-[2.5px] border-black rounded-[14px]
                         shadow-[4px_4px_0px_0px_#000000]
                         font-display font-extrabold text-[16px] tracking-[0.5px] text-black
                         transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                         disabled:opacity-60 disabled:active:shadow-[4px_4px_0px_0px_#000000]
                         disabled:active:translate-x-0 disabled:active:translate-y-0"
            >
              {joining ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              ) : (
                <>🤙 ¡UNIRME AL PARTIDO!</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
function MapPinIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function SignalIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
      <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  )
}
