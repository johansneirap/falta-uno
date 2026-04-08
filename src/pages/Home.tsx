import { useState, useEffect } from 'react'
import { useGames } from '../hooks/useGames'
import { useAuth } from '../hooks/useAuth'
import GameCard from '../components/game/GameCard'
import type { Sport, Level } from '../lib/constants'
import { LEVELS_BY_SPORT, LEVELS_GENERIC } from '../lib/constants'
import { useLocation } from 'react-router-dom'

type SportFilter = Sport | 'todos'
type LevelFilter = Level | 'todos'

const SPORT_TABS: { value: SportFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'padel', label: 'Pádel' },
  { value: 'futbol', label: 'Fútbol' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'basket', label: 'Básket' },
]

export default function Home() {
  const { games, loading, joinedGameIds, fetchGames, fetchJoinedGameIds } = useGames()
  const { user } = useAuth()
  const location = useLocation()
  const [sport, setSport] = useState<SportFilter>('todos')
  const [level, setLevel] = useState<LevelFilter>('todos')
  const [search, setSearch] = useState('')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const [toast, setToast] = useState(
    location.state?.cancelled ? 'Partido eliminado' :
    location.state?.completed ? '✅ Partido marcado como jugado' : ''
  )

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const levelPills = [
    { value: 'todos' as LevelFilter, label: 'Todos' },
    ...(sport !== 'todos'
      ? LEVELS_BY_SPORT[sport as keyof typeof LEVELS_BY_SPORT]
      : LEVELS_GENERIC
    ),
  ]

  function handleNearMe() {
    if (userCoords) { setUserCoords(null); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setUserCoords({ lat: latitude, lng: longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const filtered = search.trim()
    ? games.filter(g => g.location_text.toLowerCase().includes(search.toLowerCase()))
    : games

  const sorted = userCoords
    ? [...filtered].sort((a, b) => {
        const distA = a.lat && a.lng ? haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) : 999
        const distB = b.lat && b.lng ? haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng) : 999
        return distA - distB
      })
    : filtered

  function handleSportChange(value: SportFilter) {
    setSport(value)
    setLevel('todos')
  }

  useEffect(() => {
    fetchGames({ sport, level })
  }, [sport, level])

  useEffect(() => {
    if (user) fetchJoinedGameIds(user.id)
  }, [user])

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      {toast && (
        <div className="mx-5 mt-3 flex items-center gap-2 bg-secondary/20 border-2 border-secondary
                        rounded-[10px] px-4 py-2.5">
          <span>✅</span>
          <span className="font-body text-[13px] text-brutal-black font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="font-display font-extrabold text-[28px] text-brutal-black">FALTA 1</h1>
        <button
          onClick={handleNearMe}
          disabled={locating}
          className={`flex items-center gap-1.5 border-2 border-black rounded-full px-3 py-1.5
                      font-display font-bold text-[12px]
                      shadow-[2px_2px_0px_0px_#000000]
                      transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                      disabled:opacity-50
                      ${userCoords ? 'bg-primary text-black' : 'bg-white text-brutal-black'}`}
        >
          <PinIcon />
          {locating ? 'Buscando...' : userCoords ? 'Cerca de mí' : 'Cerca de mí'}
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 bg-white border-2 border-black rounded-[10px]
                        shadow-[2px_2px_0px_0px_#000000] px-3 h-10">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cancha o ubicación..."
            className="flex-1 bg-transparent font-body text-[13px] text-brutal-black
                       placeholder:text-gray-400 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-lg leading-none">✕</button>
          )}
        </div>
      </div>

      {/* Sport tabs */}
      <div className="px-5">
        <div className="flex h-10 border-2 border-black rounded-full overflow-hidden">
          {SPORT_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleSportChange(tab.value)}
              className={`flex-1 font-display text-[13px] font-semibold transition-colors
                ${sport === tab.value
                  ? 'bg-primary text-black'
                  : 'text-gray-400 hover:text-brutal-black'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level pills */}
      <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {levelPills.map(pill => (
          <button
            key={pill.value}
            onClick={() => setLevel(pill.value)}
            className={`flex-shrink-0 font-body text-[12px] font-semibold
                        border-2 border-black rounded-full px-3 py-1.5
                        shadow-[2px_2px_0px_0px_#000000]
                        transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]
                        ${level === pill.value
                          ? 'bg-brutal-black text-white'
                          : 'bg-white text-brutal-black'}`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-3 px-5 pt-3 pb-4 overflow-y-auto flex-1">
        {loading && (
          <div className="flex justify-center pt-12">
            <svg className="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <span className="text-5xl">🏟️</span>
            <p className="font-display font-bold text-[16px] text-brutal-black">
              {search ? 'Sin resultados para esa búsqueda' : 'No hay partidos disponibles'}
            </p>
            {!search && (
              <p className="font-body text-[13px] text-gray-400">¡Sé el primero en crear uno!</p>
            )}
          </div>
        )}

        {!loading && sorted.map(game => (
          <GameCard key={game.id} game={game} joined={joinedGameIds.has(game.id)} />
        ))}
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 flex-shrink-0">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
