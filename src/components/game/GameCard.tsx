import { useNavigate } from 'react-router-dom'
import type { Game, Sport } from '../../lib/constants'
import { LEVEL_LABEL_MAP, LEVEL_COLOR_MAP } from '../../lib/constants'

const SPORT_EMOJI: Record<Sport, string> = {
  padel: '🎾', futbol: '⚽', tenis: '🎾', basket: '🏀',
}
const SPORT_LABEL: Record<Sport, string> = {
  padel: 'Pádel', futbol: 'Fútbol', tenis: 'Tenis', basket: 'Básket',
}
const FORMAT_LABEL: Record<string, string> = {
  dobles: 'Dobles', singles: 'Singles',
  '5v5': '5 vs 5', '7v7': '7 vs 7', '11v11': '11 vs 11', '3v3': '3 vs 3',
}

function formatDatetime(iso: string) {
  const date = new Date(iso)
  const day = date.toLocaleDateString('es-CL', { weekday: 'short' })
  const num = date.getDate()
  const month = date.toLocaleDateString('es-CL', { month: 'short' })
  const time = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('.', '')
  return `${cap(day)} ${num} ${cap(month)} · ${time}`
}

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate()
  const slotsLeft = game.slots_available

  return (
    <div
      className="bg-white border-2 border-black rounded-[12px] shadow-brutal p-4 flex flex-col gap-3 w-full cursor-pointer
                 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
      onClick={() => navigate(`/partido/${game.id}`)}
    >
      {/* Top: deporte + nivel badge */}
      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-[15px] text-brutal-black">
          {SPORT_EMOJI[game.sport]} {SPORT_LABEL[game.sport]} · {FORMAT_LABEL[game.format] ?? game.format}
        </span>
        <span className={`text-xs font-display font-bold border-[1.5px] border-black rounded-full px-[10px] py-1 ${LEVEL_COLOR_MAP[game.level_required] ?? 'bg-gray-100 text-gray-800'}`}>
          {LEVEL_LABEL_MAP[game.level_required] ?? game.level_required}
        </span>
      </div>

      {/* Ubicación */}
      <div className="flex items-center gap-1.5">
        <MapPinIcon />
        <span className="font-body text-[13px] text-gray-500">{game.location_text}</span>
      </div>

      {/* Fecha y hora */}
      <div className="flex items-center gap-1.5">
        <CalendarIcon />
        <span className="font-body text-[13px] text-gray-500">{formatDatetime(game.datetime)}</span>
      </div>

      {/* Bottom: cupos + botón */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <UsersIcon />
          {slotsLeft > 0 ? (
            <span className="font-display font-bold text-[13px] text-danger">
              Faltan {slotsLeft}
            </span>
          ) : (
            <span className="font-display font-bold text-[13px] text-gray-400">
              Completo
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/partido/${game.id}`) }}
          className="bg-primary border-2 border-black rounded-full px-4 py-2
                     font-display font-bold text-[13px] text-black
                     shadow-[3px_3px_0px_0px_#000000]
                     transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
        >
          Unirme
        </button>
      </div>
    </div>
  )
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}
